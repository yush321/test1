import React, { useState, useEffect, useCallback } from 'react';
// !!!! './index.css' import 라인 제거됨 !!!!
// CSS import는 이제 src/main.jsx 에서 처리합니다.

// --- Helper 함수: Hex 색상 및 투명도 -> RGBA 변환 ---
function hexToRgba(hexInput, opacityValue = 1.0) {
    let hex = String(hexInput || '').trim();
    if (!hex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(hex)) { hex = '#' + hex; }
    else if (!hex.startsWith('#') && /^[0-9A-Fa-f]{3}$/.test(hex)) { hex = '#' + hex; }

    // opacityValue가 Tailwind 클래스 형태인지 확인 ('bg-opacity-XX')
    const opacityMatch = String(opacityValue).match(/bg-opacity-(\d+)$/);
    let numericOpacity = 1.0; // 기본값 불투명
    if (opacityMatch) {
        numericOpacity = parseInt(opacityMatch[1], 10) / 100;
    } else {
        // 숫자로 변환 시도
        const parsedFloat = parseFloat(opacityValue);
        if (!isNaN(parsedFloat)) {
            numericOpacity = Math.max(0, Math.min(1, parsedFloat)); // 0과 1 사이로 제한
        }
    }


    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
    else if (hex.length === 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); }
    else { console.warn(`Invalid hex: ${hexInput}`); return `rgba(0, 0, 0, ${numericOpacity})`; }
    if (isNaN(r) || isNaN(g) || isNaN(b)) { console.warn(`Parse failed: ${hexInput}`); return `rgba(0, 0, 0, ${numericOpacity})`; }
    return `rgba(${r}, ${g}, ${b}, ${numericOpacity})`;
}

// --- Helper 함수: 위치 문자열 -> Absolute Positioning 스타일 변환 ---
function getPositionStyles(positionString = 'center-center') {
    // position: 'absolute' 를 포함하여 스타일 객체 반환
    const styles = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bottom: 'auto', right: 'auto' };
    const margin = '2rem'; // 화면 가장자리 여백

    if (positionString.includes('top')) { styles.top = margin; styles.transform = 'translate(-50%, 0)'; }
    if (positionString.includes('bottom')) { styles.top = 'auto'; styles.bottom = margin; styles.transform = 'translate(-50%, 0)';}
    if (positionString.includes('left')) { styles.left = margin; styles.transform = styles.transform.replace('-50%', '0'); }
    if (positionString.includes('right')) { styles.left = 'auto'; styles.right = margin; styles.transform = styles.transform.replace('-50%', '0'); }

    // 중앙 및 모서리 정렬 재조정
    if (positionString === 'top-center') { styles.transform = 'translate(-50%, 0)'; }
    if (positionString === 'bottom-center') { styles.transform = 'translate(-50%, 0)'; }
    if (positionString === 'center-left') { styles.transform = 'translate(0, -50%)'; }
    if (positionString === 'center-right') { styles.transform = 'translate(0, -50%)'; }
    if (positionString === 'center-center') { styles.transform = 'translate(-50%, -50%)'; }
    if (positionString === 'top-left') { styles.transform = 'translate(0, 0)'; }
    if (positionString === 'top-right') { styles.transform = 'translate(0, 0)'; }
    if (positionString === 'bottom-left') { styles.transform = 'translate(0, 0)'; }
    if (positionString === 'bottom-right') { styles.transform = 'translate(0, 0)'; }

    return styles;
}

// --- Helper 함수: 텍스트 정렬 문자열 -> Tailwind 클래스 변환 ---
function getTextAlignClass(alignString = 'center') {
     switch (alignString) { case 'left': return 'text-left'; case 'right': return 'text-right'; case 'center': default: return 'text-center'; }
}

// --- Helper 함수: 버튼 그룹 정렬 문자열 -> Tailwind 클래스 변환 ---
function getChoicesAlignmentClass(alignmentString) {
    switch (alignmentString) { case 'left': return 'items-start'; case 'right': return 'items-end'; case 'center': default: return 'items-center'; }
}

// --- 컴포넌트 정의 ---

// 질문 컴포넌트
function Question({ text, color, fontSize, textAlign, containerStyles }) {
    const textStyle = {
        color: hexToRgba(color || '#FFFFFF'),
    };
    // containerStyles는 Tailwind 클래스 문자열이어야 함
    const containerClass = ` ${containerStyles || ''}`;
    const textClass = `leading-relaxed whitespace-pre-line max-w-prose ${fontSize || 'text-xl'} ${getTextAlignClass(textAlign)}`;

    return (
        <div className={containerClass}>
            <p className={textClass} style={textStyle}>
                {text}
            </p>
        </div>
    );
}

// 답변 버튼 컴포넌트
function ChoiceButton({ choice, sceneData, onChoiceClick }) {
    const {
        buttonFontSize = 'text-base',
        buttonTextColor = '#374151',
        buttonBgColor = '#FFFFFF',
        buttonBgOpacity = '1',
        buttonHoverTextColor = buttonTextColor,
        buttonHoverBgColor = buttonBgColor,
    } = sceneData;

    // 투명도 값 계산 (Tailwind 클래스 또는 숫자)
    const opacityValue = String(buttonBgOpacity).includes('bg-opacity-')
        ? parseInt(String(buttonBgOpacity).split('-').pop() || '100', 10) / 100
        : parseFloat(buttonBgOpacity) || 1.0;

    // 기본 스타일과 호버 스타일 정의
    const normalStyle = {
        color: hexToRgba(buttonTextColor),
        backgroundColor: hexToRgba(buttonBgColor, opacityValue),
    };
    const hoverStyle = {
        color: hexToRgba(buttonHoverTextColor),
        backgroundColor: hexToRgba(buttonHoverBgColor, opacityValue),
    };

    // 버튼 호버 상태 관리
    const [currentStyle, setCurrentStyle] = useState(normalStyle);

    // sceneData 변경 시 스타일 초기화
    useEffect(() => {
        setCurrentStyle({
            color: hexToRgba(buttonTextColor),
            backgroundColor: hexToRgba(buttonBgColor, opacityValue),
        });
    }, [sceneData, buttonTextColor, buttonBgColor, buttonBgOpacity, opacityValue]);

    return (
        <button
            className={`choice-button ${buttonFontSize}`} // 기본 스타일 적용
            style={currentStyle} // 동적 스타일 적용
            onClick={() => onChoiceClick(choice.nextSceneId)}
            onMouseOver={() => setCurrentStyle(hoverStyle)}
            onMouseOut={() => setCurrentStyle(normalStyle)}
        >
            {choice.text}
        </button>
    );
}

// 답변 목록 컴포넌트
function Choices({ choices, sceneData, onChoiceClick, alignment, containerStyles }) {
    const containerClass = ` ${containerStyles || ''}`;
    const choicesListClass = `flex flex-col space-y-4 ${getChoicesAlignmentClass(alignment)}`;
    const { currentSceneId } = sceneData; // App에서 전달된 sceneData 사용

    return (
        <div className={containerClass}>
            <div className={choicesListClass}>
                {/* choices 배열 유효성 검사 강화 */}
                {Array.isArray(choices) && choices.length > 0 ? (
                    choices.map((choice, index) => (
                        <ChoiceButton
                            key={`${currentSceneId}-${index}`} // key 안정성 개선
                            choice={choice}
                            sceneData={sceneData}
                            onChoiceClick={onChoiceClick}
                        />
                    ))
                ) : (
                    <p className="text-gray-400 italic">선택지가 없습니다.</p> // 선택지 없을 때 메시지
                )}
            </div>
        </div>
    );
}


// 메인 앱 컴포넌트
function App() {
    const [storyData, setStoryData] = useState([]);
    const [currentSceneId, setCurrentSceneId] = useState(1); // 초기 sceneId는 1로 시작
    const [currentScene, setCurrentScene] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // !!!! 중요 !!!! : Sheet.best API URL 업데이트됨
    const SHEET_BEST_URL = 'https://api.sheetbest.com/sheets/ef71f253-1e87-4c1c-920e-e941f3c4323a';

    // --- choices 문자열 파싱 함수 ---
    const parseChoices = useCallback((choicesString) => {
        if (choicesString === null || choicesString === undefined) return [];
        if (Array.isArray(choicesString)) return choicesString;
        if (typeof choicesString !== 'string' || choicesString.trim() === '') return [];
        try {
            const cleanedString = choicesString.replace(/[\n\r\t]/g, '').trim();
            const parsed = JSON.parse(cleanedString);
            if (!Array.isArray(parsed)) {
                 console.warn("Parsed choices is not an array:", parsed);
                 return [];
            }
            return parsed.map(choice => {
                const nextId = parseInt(choice.nextSceneId, 10);
                if (typeof choice.text !== 'string' || isNaN(nextId)) {
                    console.warn("Invalid choice format found:", choice);
                    return null;
                }
                return { ...choice, nextSceneId: nextId };
            }).filter(choice => choice !== null);
        } catch (e) {
            console.error("Failed to parse choices string:", `"${choicesString}"`, "\nError:", e);
            throw new Error(`'choices' 데이터 파싱 오류: ${e.message}. 입력값: "${choicesString}"`);
        }
    }, []);

    // --- 데이터 가져오기 ---
    useEffect(() => {
        const fetchData = async () => {
            if (!SHEET_BEST_URL || !SHEET_BEST_URL.startsWith('https://api.sheetbest.com/')) {
                 setError("유효하지 않은 Sheet.best API URL입니다. URL을 확인하고 App.jsx 파일을 수정하세요.");
                 setIsLoading(false);
                 return;
            }

            setIsLoading(true);
            setError(null);
            console.log("Fetching data from Sheet.best:", SHEET_BEST_URL);
            try {
                const response = await fetch(SHEET_BEST_URL);
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("Sheet.best fetch error body:", errorBody);
                    const statusText = response.status === 400
                        ? `(Bad Request - Google Sheets 데이터 형식, 헤더 또는 URL을 확인하세요)`
                        : `(status: ${response.status})`;
                    throw new Error(`HTTP error! ${statusText}`);
                }
                const data = await response.json();
                console.log("Data fetched successfully (raw):", data);

                if (!Array.isArray(data)) {
                    console.error("Fetched data is not an array:", data);
                    throw new Error("Sheet.best에서 반환된 데이터 형식이 올바르지 않습니다. 배열이어야 합니다.");
                }

                let processingError = null;
                const formattedData = data.map((row, index) => {
                    try {
                        const sceneId = parseInt(row.sceneId, 10);
                        if (isNaN(sceneId)) {
                            console.warn(`Invalid sceneId found at row ${index + 1}:`, row.sceneId);
                            return null;
                        }
                        return {
                            ...row,
                            sceneId: sceneId,
                            choices: parseChoices(row.choices),
                        };
                    } catch (parseError) {
                        console.error(`Error processing row ${index + 1}:`, parseError);
                        processingError = parseError;
                        return null;
                    }
                }).filter(row => row !== null);

                if (processingError) {
                    throw processingError;
                }

                if (formattedData.length === 0 && data.length > 0) {
                     throw new Error("데이터를 가져왔으나 유효한 장면 형식이 없습니다. Google Sheets의 sceneId 및 choices 형식을 확인하세요.");
                }
                if (formattedData.length === 0) {
                     throw new Error("시나리오 데이터를 찾을 수 없습니다. Google Sheets에 데이터가 있는지 확인하세요.");
                }

                formattedData.sort((a, b) => a.sceneId - b.sceneId);
                console.log("Formatted data:", formattedData);
                setStoryData(formattedData);

                // 초기 장면 ID 설정 (데이터 설정 후)
                const initialSceneId = 1;
                const firstScene = formattedData.find(s => s.sceneId === initialSceneId);
                 if (firstScene) {
                     console.log("Initial scene ID set to:", initialSceneId);
                     setCurrentSceneId(initialSceneId);
                 } else {
                     console.warn("Scene ID 1 not found, starting with the first available scene:", formattedData[0].sceneId);
                     setCurrentSceneId(formattedData[0].sceneId);
                 }

            } catch (e) {
                console.error("Failed to fetch or process story data:", e);
                setError(`게임 데이터 처리 중 오류 발생: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [SHEET_BEST_URL, parseChoices]);

    // --- 현재 장면 데이터 설정 ---
    useEffect(() => {
        if (storyData.length > 0) {
            const scene = storyData.find(s => s.sceneId === currentSceneId);
            if (scene) {
                setCurrentScene(scene);
            } else {
                console.error(`Critical Error: Scene with ID ${currentSceneId} not found after data load.`);
                setError(`오류: 장면(ID: ${currentSceneId})을 찾을 수 없습니다.`);
            }
        }
    }, [currentSceneId, storyData]);

    // --- 배경 및 BGM 업데이트 (currentScene 변경 시) ---
    useEffect(() => {
        if (currentScene) {
            const gameBody = document.getElementById('game-body');
            if (gameBody) {
                 if (currentScene.backgroundImage) {
                     const imageUrl = currentScene.backgroundImage.startsWith('/')
                                     ? currentScene.backgroundImage
                                     : `/${currentScene.backgroundImage}`;
                     gameBody.style.backgroundImage = `url(${imageUrl})`;
                     gameBody.style.backgroundSize = 'cover';
                     gameBody.style.backgroundPosition = 'center';
                     gameBody.style.backgroundRepeat = 'no-repeat';
                     gameBody.style.transition = 'background-image 0.8s ease-in-out';
                 } else {
                     gameBody.style.backgroundImage = 'none';
                     gameBody.style.backgroundColor = '#333';
                 }
            }

            const bgmPlayer = document.getElementById('bgm-player');
            if (bgmPlayer) {
                const musicSrc = currentScene.backgroundMusic;
                const currentSrc = bgmPlayer.getAttribute('src');
                const correctedMusicSrc = musicSrc && !musicSrc.startsWith('/') && !musicSrc.startsWith('http')
                                        ? `/${musicSrc}`
                                        : musicSrc;

                if (correctedMusicSrc && correctedMusicSrc !== currentSrc) {
                    console.log("Updating BGM to:", correctedMusicSrc);
                    bgmPlayer.src = correctedMusicSrc;
                    bgmPlayer.load();
                } else if (!correctedMusicSrc && currentSrc) {
                    console.log("Pausing BGM.");
                    bgmPlayer.pause();
                    bgmPlayer.currentTime = 0;
                    bgmPlayer.removeAttribute('src');
                }
            }
        }
    }, [currentScene]);


    // --- 답변 선택 처리 ---
    const handleChoiceClick = useCallback((nextSceneId) => {
        if (nextSceneId === null || nextSceneId === undefined) {
            console.error("Invalid nextSceneId:", nextSceneId);
            return;
        }
        if (!storyData.some(scene => scene.sceneId === nextSceneId)) {
            console.error(`Next scene ID ${nextSceneId} does not exist.`);
            setError(`오류: 다음 장면(ID: ${nextSceneId})을 찾을 수 없습니다. Google Sheets 데이터를 확인하세요.`);
            return;
        }

        console.log(`Choice clicked! Transitioning to scene ID: ${nextSceneId}`);
        setError(null);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentSceneId(nextSceneId);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 300);
    }, [storyData]);

    // --- 렌더링 ---
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">로딩 중...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-500 p-8 bg-gray-900 text-center">{error}</div>;
    }

    if (!currentScene) {
        return <div className="flex items-center justify-center min-h-screen text-yellow-500 bg-gray-900">장면 데이터를 표시할 수 없습니다. 로딩 후 잠시 기다려주세요.</div>;
    }

    const questionPosStyle = getPositionStyles(currentScene.questionPosition);
    const choicesPosStyle = getPositionStyles(currentScene.choicesPosition);
    const contentOpacityStyle = { opacity: isTransitioning ? 0 : 1 };
    const transitionClasses = "transition-opacity duration-300 ease-in-out";

    return (
        <div id="game-body" className="min-h-screen bg-gray-900 relative overflow-hidden">
                {/* 질문 영역 */}
                <div
                    id="question-container"
                    style={{ ...questionPosStyle, ...contentOpacityStyle }}
                    className={`max-w-[90%] ${transitionClasses}`}
                >
                    {currentScene && (
                        <Question
                            text={currentScene.question}
                            color={currentScene.questionColor}
                            fontSize={currentScene.questionFontSize}
                            textAlign={currentScene.questionTextAlign}
                            containerStyles={currentScene.questionContainerStyles}
                        />
                    )}
                </div>

                {/* 답변 영역 */}
                <div
                    id="choices-container"
                     style={{ ...choicesPosStyle, ...contentOpacityStyle }}
                     className={`max-w-[90%] ${transitionClasses} delay-100`}
                >
                    {currentScene && (
                        <Choices
                            choices={currentScene.choices || []}
                            sceneData={{...currentScene, currentSceneId}}
                            onChoiceClick={handleChoiceClick}
                            alignment={currentScene.choicesAlignment}
                            containerStyles={currentScene.choicesContainerStyles}
                        />
                    )}
                </div>
                 <audio id="bgm-player" loop></audio>
        </div>
    );
}

export default App;
