import React, { useState, useEffect, useCallback } from 'react';
// !!!! './index.css' import 라인 제거됨 !!!!
// CSS import는 이제 src/main.jsx 에서 처리합니다.

// --- Helper 함수: Hex 색상 및 투명도 -> RGBA 변환 ---
function hexToRgba(hexInput, opacityValue = 1.0) {
    let hex = String(hexInput || '').trim();
    if (!hex.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(hex)) { hex = '#' + hex; }
    else if (!hex.startsWith('#') && /^[0-9A-Fa-f]{3}$/.test(hex)) { hex = '#' + hex; }
    const opacityMatch = String(opacityValue).match(/bg-opacity-(\d+)$/);
    let numericOpacity = 1.0;
    if (opacityMatch) { numericOpacity = parseInt(opacityMatch[1], 10) / 100; }
    else { const parsedFloat = parseFloat(opacityValue); if (!isNaN(parsedFloat)) { numericOpacity = Math.max(0, Math.min(1, parsedFloat)); } }
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
    else if (hex.length === 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); }
    else { console.warn(`Invalid hex: ${hexInput}`); return `rgba(0, 0, 0, ${numericOpacity})`; }
    if (isNaN(r) || isNaN(g) || isNaN(b)) { console.warn(`Parse failed: ${hexInput}`); return `rgba(0, 0, 0, ${numericOpacity})`; }
    return `rgba(${r}, ${g}, ${b}, ${numericOpacity})`;
}

// --- Helper 함수: 위치 문자열 -> Absolute Positioning 스타일 변환 ---
function getPositionStyles(positionString = 'center-center') {
    // zIndex를 10으로 설정하여 다른 요소 위에 오도록 함
    const styles = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bottom: 'auto', right: 'auto', zIndex: 10 };
    const margin = '2rem';
    if (positionString.includes('top')) { styles.top = margin; styles.transform = 'translate(-50%, 0)'; }
    if (positionString.includes('bottom')) { styles.top = 'auto'; styles.bottom = margin; styles.transform = 'translate(-50%, 0)';}
    if (positionString.includes('left')) { styles.left = margin; styles.transform = styles.transform.replace('-50%', '0'); }
    if (positionString.includes('right')) { styles.left = 'auto'; styles.right = margin; styles.transform = styles.transform.replace('-50%', '0'); }
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

// !!!! ImageFrame 컴포넌트를 App 컴포넌트 바깥으로 이동 !!!!
function ImageFrame({ imageUrl, containerStyles }) {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!imageUrl) {
            setIsImageLoading(false);
            setImageError(true);
            return;
        };
        setIsImageLoading(true);
        setImageError(false);
        const img = new Image();
        img.onload = () => {
            console.log("[Debug] Image loaded for frame:", imageUrl);
            setIsImageLoading(false);
            setImageError(false);
        };
        img.onerror = () => {
            console.error("[Debug] Failed to load image for frame:", imageUrl);
            setIsImageLoading(false);
            setImageError(true);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const containerClass = ` ${containerStyles || 'w-64 h-auto p-1 bg-gray-300 rounded shadow'}`;

    return (
        <div className={containerClass}>
            {isImageLoading && <div className="w-full h-32 bg-gray-200 animate-pulse rounded"></div>}
            {!isImageLoading && imageError && (
                <div className="w-full h-32 flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded">
                    이미지 로드 실패
                </div>
            )}
            {!isImageLoading && !imageError && imageUrl && (
                <img
                    src={imageUrl}
                    alt="Scene Image"
                    className="w-full h-full object-cover rounded"
                />
            )}
             {!isImageLoading && !imageError && !imageUrl && (
                 <div className="w-full h-32 flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded">
                    이미지 없음
                </div>
             )}
        </div>
    );
}

// 질문 컴포넌트
function Question({ text, color, fontSize, textAlign, containerStyles }) {
    const textStyle = { color: hexToRgba(color || '#FFFFFF'), };
    const containerClass = ` ${containerStyles || ''}`;
    const textClass = `leading-relaxed whitespace-pre-line max-w-prose ${fontSize || 'text-xl'} ${getTextAlignClass(textAlign)}`;
    if (!text) return null;
    return ( <div className={containerClass}> <p className={textClass} style={textStyle}> {text} </p> </div> );
}

// 답변 버튼 컴포넌트
function ChoiceButton({ choice, sceneData, onChoiceClick }) {
    const { buttonFontSize = 'text-base', buttonTextColor = '#374151', buttonBgColor = '#FFFFFF', buttonBgOpacity = '1', buttonHoverTextColor = buttonTextColor, buttonHoverBgColor = buttonBgColor, } = sceneData;
    const opacityValue = String(buttonBgOpacity).includes('bg-opacity-') ? parseInt(String(buttonBgOpacity).split('-').pop() || '100', 10) / 100 : parseFloat(buttonBgOpacity) || 1.0;
    const normalStyle = { color: hexToRgba(buttonTextColor), backgroundColor: hexToRgba(buttonBgColor, opacityValue), };
    const hoverStyle = { color: hexToRgba(buttonHoverTextColor), backgroundColor: hexToRgba(buttonHoverBgColor, opacityValue), };
    const [currentStyle, setCurrentStyle] = useState(normalStyle);
    useEffect(() => { setCurrentStyle({ color: hexToRgba(buttonTextColor), backgroundColor: hexToRgba(buttonBgColor, opacityValue), }); }, [sceneData, buttonTextColor, buttonBgColor, buttonBgOpacity, opacityValue]);
    return ( <button className={`choice-button ${buttonFontSize}`} style={currentStyle} onClick={() => onChoiceClick(choice.nextSceneId)} onMouseOver={() => setCurrentStyle(hoverStyle)} onMouseOut={() => setCurrentStyle(normalStyle)} > {choice.text} </button> );
}

// 답변 목록 컴포넌트
function Choices({ choices, sceneData, onChoiceClick, alignment, containerStyles }) {
    const containerClass = ` ${containerStyles || ''}`;
    const choicesListClass = `flex flex-col space-y-4 ${getChoicesAlignmentClass(alignment)}`;
    const { currentSceneId } = sceneData;
    if (!Array.isArray(choices) || choices.length === 0) {
        return null;
    }
    return ( <div className={containerClass}> <div className={choicesListClass}> {choices.map((choice, index) => ( <ChoiceButton key={`${currentSceneId}-${index}`} choice={choice} sceneData={sceneData} onChoiceClick={onChoiceClick} /> )) } </div> </div> );
}


// 메인 앱 컴포넌트
function App() {
    const [storyData, setStoryData] = useState([]);
    const [currentSceneId, setCurrentSceneId] = useState(1);
    const [currentScene, setCurrentScene] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [shareMessage, setShareMessage] = useState(''); // 공유 메시지 상태 추가

    // Sheet.best API URL (이전 제공 값 사용)
    const SHEET_BEST_URL = 'https://api.sheetbest.com/sheets/8eb81a40-232e-413d-8740-a0a774fd4ab6';

    // --- choices 문자열 파싱 함수 ---
    const parseChoices = useCallback((choicesString) => {
        if (choicesString === null || choicesString === undefined) return [];
        if (Array.isArray(choicesString)) return choicesString;
        if (typeof choicesString !== 'string' || choicesString.trim() === '') return [];
        try {
            const cleanedString = choicesString.replace(/[\n\r\t]/g, '').trim();
             // 빈 문자열이면 빈 배열 반환
            if (!cleanedString) return [];
            const parsed = JSON.parse(cleanedString);
            if (!Array.isArray(parsed)) { console.warn("Parsed choices is not an array:", parsed); return []; }
            return parsed.map(choice => {
                const nextId = parseInt(choice.nextSceneId, 10);
                if (typeof choice.text !== 'string' || isNaN(nextId)) { console.warn("Invalid choice format found:", choice); return null; }
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
                 setError("유효하지 않은 Sheet.best API URL입니다."); setIsLoading(false); return;
            }
            setIsLoading(true); setError(null);
            console.log("Fetching data from Sheet.best:", SHEET_BEST_URL);
            try {
                const response = await fetch(SHEET_BEST_URL);
                if (!response.ok) {
                    const errorBody = await response.text(); console.error("Sheet.best fetch error body:", errorBody);
                    const statusText = response.status === 400 ? `(Bad Request - Google Sheets 데이터 형식/헤더/URL 확인)` : `(status: ${response.status})`;
                    throw new Error(`HTTP error! ${statusText}`);
                }
                const data = await response.json(); console.log("Data fetched (raw):", data);
                if (!Array.isArray(data)) { throw new Error("Sheet.best 응답 데이터 형식이 배열이 아닙니다."); }

                let processingError = null;
                const formattedData = data.map((row, index) => {
                    try {
                        const sceneId = parseInt(row.sceneId, 10);
                        if (isNaN(sceneId)) { console.warn(`Invalid sceneId @ row ${index + 1}:`, row.sceneId); return null; }
                        return {
                            ...row,
                            sceneId: sceneId,
                            choices: parseChoices(row.choices),
                            sceneType: row.sceneType || 'question' // sceneType 가져오기
                        };
                    } catch (parseError) { console.error(`Error processing row ${index + 1}:`, parseError); processingError = parseError; return null; }
                }).filter(row => row !== null);

                if (processingError) { throw processingError; }
                if (formattedData.length === 0 && data.length > 0) { throw new Error("데이터는 가져왔으나 유효한 장면 형식이 없습니다. sceneId/choices 확인."); }
                if (formattedData.length === 0) { throw new Error("시나리오 데이터를 찾을 수 없습니다. Google Sheets 확인."); }

                formattedData.sort((a, b) => a.sceneId - b.sceneId);
                console.log("Formatted data:", formattedData);
                setStoryData(formattedData);

                // 초기 장면 ID 설정 (1번 우선)
                const initialSceneId = 1;
                const firstScene = formattedData.find(s => s.sceneId === initialSceneId) || formattedData[0];
                if (firstScene) {
                    console.log("Initial scene ID:", firstScene.sceneId);
                    setCurrentSceneId(firstScene.sceneId);
                } else { setError("초기 장면을 설정할 수 없습니다."); }

            } catch (e) { console.error("Fetch/process error:", e); setError(`데이터 처리 오류: ${e.message}`);
            } finally { setIsLoading(false); }
        };
        fetchData();
    }, [SHEET_BEST_URL, parseChoices]);

    // --- 현재 장면 데이터 설정 ---
    useEffect(() => {
        if (storyData.length > 0) {
            const scene = storyData.find(s => s.sceneId === currentSceneId);
            if (scene) { setCurrentScene(scene); setShareMessage(''); } // 장면 변경 시 공유 메시지 초기화
            else { console.error(`Critical Error: Scene ID ${currentSceneId} not found.`); setError(`오류: 장면(ID: ${currentSceneId}) 없음.`); }
        }
    }, [currentSceneId, storyData]);

    // --- 답변 선택 처리 ---
    const handleChoiceClick = useCallback((nextSceneId) => {
        if (nextSceneId === null || nextSceneId === undefined) { console.error("Invalid nextSceneId:", nextSceneId); return; }
        if (!storyData.some(scene => scene.sceneId === nextSceneId)) { console.error(`Next scene ID ${nextSceneId} does not exist.`); setError(`오류: 다음 장면(ID: ${nextSceneId}) 없음.`); return; }
        console.log(`Choice clicked! Transitioning to scene ID: ${nextSceneId}`);
        setError(null);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentSceneId(nextSceneId);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 300);
    }, [storyData]);

    // --- 공유 버튼 클릭 처리 ---
    const handleShareClick = useCallback(async () => {
        if (!currentScene || currentScene.sceneType !== 'ending') return;
        const shareText = `[게임 결과]\n${currentScene.question}\n\n${window.location.href}`;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareText);
                setShareMessage('결과가 클립보드에 복사되었습니다!');
                console.log('Result copied to clipboard');
            } else if (navigator.share) {
                 await navigator.share({ title: '게임 결과 공유', text: shareText, });
                 setShareMessage('공유 완료!');
                 console.log('Result shared via Web Share API');
            } else {
                 setShareMessage('공유 기능을 지원하지 않는 환경입니다.');
                 console.warn('Clipboard API and Web Share API not supported.');
            }
        } catch (err) {
            console.error('Failed to share:', err);
            setShareMessage('공유 중 오류가 발생했습니다.');
        }
        setTimeout(() => setShareMessage(''), 3000);
    }, [currentScene]);


    // --- 렌더링 ---
    if (isLoading) { return <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">로딩 중...</div>; }
    if (error) { return <div className="flex items-center justify-center min-h-screen text-red-500 p-8 bg-gray-900 text-center">{error}</div>; }
    if (!currentScene) { return <div className="flex items-center justify-center min-h-screen text-yellow-500 bg-gray-900">장면 데이터 준비 중...</div>; }

    const questionPosStyle = getPositionStyles(currentScene.questionPosition);
    const imagePosStyle = getPositionStyles(currentScene.imagePosition || 'center-center');
    const choicesPosStyle = getPositionStyles(currentScene.choicesPosition);
    const contentOpacityStyle = { opacity: isTransitioning ? 0 : 1 };
    const transitionClasses = "transition-opacity duration-300 ease-in-out";
    const isEndingScene = currentScene.sceneType === 'ending';

    return (
        // 최상위 div
        <div id="game-container" className="min-h-screen bg-gray-900 relative overflow-hidden">
            {/* 이미지 프레임 영역 */}
            <div id="image-frame-container" style={{ ...imagePosStyle, ...contentOpacityStyle }} className={`max-w-[90%] ${transitionClasses} delay-50`}>
                 {currentScene && (
                    <ImageFrame
                        imageUrl={currentScene.backgroundImage} // 이미지 프레임 URL
                        containerStyles={currentScene.imageContainerStyles}
                    />
                 )}
            </div>

            {/* 질문/결과 텍스트 영역 */}
            <div id="question-container" style={{ ...questionPosStyle, ...contentOpacityStyle }} className={`max-w-[90%] ${transitionClasses}`}>
                {currentScene && ( <Question text={currentScene.question} color={currentScene.questionColor} fontSize={currentScene.questionFontSize} textAlign={currentScene.questionTextAlign} containerStyles={currentScene.questionContainerStyles} /> )}
            </div>

            {/* 답변 영역 또는 공유 버튼 영역 */}
            <div id="choices-or-share-container" style={{ ...choicesPosStyle, ...contentOpacityStyle }} className={`max-w-[90%] ${transitionClasses} delay-100`}>
                {currentScene && !isEndingScene && ( // 엔딩 아닐 때
                    <Choices
                        choices={currentScene.choices || []}
                        sceneData={{...currentScene, currentSceneId}}
                        onChoiceClick={handleChoiceClick}
                        alignment={currentScene.choicesAlignment}
                        containerStyles={currentScene.choicesContainerStyles}
                    />
                )}
                {currentScene && isEndingScene && ( // 엔딩일 때
                    <div className={`flex flex-col items-${currentScene.choicesAlignment || 'center'} ${currentScene.choicesContainerStyles || 'p-6 mb-8'}`}>
                        <button
                            onClick={handleShareClick}
                            className="choice-button bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md transition duration-300"
                        >
                            결과 공유하기
                        </button>
                        {shareMessage && ( <p className="mt-2 text-sm text-green-400">{shareMessage}</p> )}
                         <button
                            onClick={() => handleChoiceClick(1)} // 1번 씬으로
                            className="choice-button bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg shadow-md transition duration-300 mt-4"
                        >
                            다시 시작하기
                        </button>
                    </div>
                )}
            </div>
             {/* 오디오 태그 제거됨 */}
        </div>
    );
}

export default App;
