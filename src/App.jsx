import React, { useState, useEffect, useCallback } from 'react';
// !!!! './index.css' import 라인 제거됨 !!!!
// CSS import는 이제 src/main.jsx 에서 처리합니다.

// --- Helper 함수들 (hexToRgba, getPositionStyles, getTextAlignClass, getChoicesAlignmentClass) ---
// (이전 코드와 동일)
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
function getPositionStyles(positionString = 'center-center') {
    // zIndex 추가
    const styles = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bottom: 'auto', right: 'auto', zIndex: 1 };
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
function getTextAlignClass(alignString = 'center') {
     switch (alignString) { case 'left': return 'text-left'; case 'right': return 'text-right'; case 'center': default: return 'text-center'; }
}
function getChoicesAlignmentClass(alignmentString) {
    switch (alignmentString) { case 'left': return 'items-start'; case 'right': return 'items-end'; case 'center': default: return 'items-center'; }
}


// --- 컴포넌트 정의 (Question, ChoiceButton, Choices) ---
function Question({ text, color, fontSize, textAlign, containerStyles }) {
    const textStyle = { color: hexToRgba(color || '#FFFFFF'), };
    const containerClass = ` ${containerStyles || ''}`;
    const textClass = `leading-relaxed whitespace-pre-line max-w-prose ${fontSize || 'text-xl'} ${getTextAlignClass(textAlign)}`;
    return ( <div className={containerClass}> <p className={textClass} style={textStyle}> {text} </p> </div> );
}
function ChoiceButton({ choice, sceneData, onChoiceClick }) {
    const { buttonFontSize = 'text-base', buttonTextColor = '#374151', buttonBgColor = '#FFFFFF', buttonBgOpacity = '1', buttonHoverTextColor = buttonTextColor, buttonHoverBgColor = buttonBgColor, } = sceneData;
    const opacityValue = String(buttonBgOpacity).includes('bg-opacity-') ? parseInt(String(buttonBgOpacity).split('-').pop() || '100', 10) / 100 : parseFloat(buttonBgOpacity) || 1.0;
    const normalStyle = { color: hexToRgba(buttonTextColor), backgroundColor: hexToRgba(buttonBgColor, opacityValue), };
    const hoverStyle = { color: hexToRgba(buttonHoverTextColor), backgroundColor: hexToRgba(buttonHoverBgColor, opacityValue), };
    const [currentStyle, setCurrentStyle] = useState(normalStyle);
    useEffect(() => { setCurrentStyle({ color: hexToRgba(buttonTextColor), backgroundColor: hexToRgba(buttonBgColor, opacityValue), }); }, [sceneData, buttonTextColor, buttonBgColor, buttonBgOpacity, opacityValue]);
    return ( <button className={`choice-button ${buttonFontSize}`} style={currentStyle} onClick={() => onChoiceClick(choice.nextSceneId)} onMouseOver={() => setCurrentStyle(hoverStyle)} onMouseOut={() => setCurrentStyle(normalStyle)} > {choice.text} </button> );
}
function Choices({ choices, sceneData, onChoiceClick, alignment, containerStyles }) {
    const containerClass = ` ${containerStyles || ''}`;
    const choicesListClass = `flex flex-col space-y-4 ${getChoicesAlignmentClass(alignment)}`;
    const { currentSceneId } = sceneData;
    return ( <div className={containerClass}> <div className={choicesListClass}> {Array.isArray(choices) && choices.length > 0 ? ( choices.map((choice, index) => ( <ChoiceButton key={`${currentSceneId}-${index}`} choice={choice} sceneData={sceneData} onChoiceClick={onChoiceClick} /> )) ) : ( <p className="text-gray-400 italic">선택지가 없습니다.</p> )} </div> </div> );
}


// 메인 앱 컴포넌트
function App() {
    const [storyData, setStoryData] = useState([]);
    const [currentSceneId, setCurrentSceneId] = useState(1);
    const [currentScene, setCurrentScene] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [audioContextStarted, setAudioContextStarted] = useState(false);
    // 배경 스타일 상태 제거 -> useEffect에서 직접 적용
    // const [backgroundStyle, setBackgroundStyle] = useState({});

    // Sheet.best API URL (이전 제공 값 사용)
    const SHEET_BEST_URL = 'https://api.sheetbest.com/sheets/0249acce-eb5e-4c3a-9e2c-ac42c5c4d6d2';

    // --- choices 문자열 파싱 함수 ---
    const parseChoices = useCallback((choicesString) => {
        if (choicesString === null || choicesString === undefined) return [];
        if (Array.isArray(choicesString)) return choicesString;
        if (typeof choicesString !== 'string' || choicesString.trim() === '') return [];
        try {
            const cleanedString = choicesString.replace(/[\n\r\t]/g, '').trim();
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
                        return { ...row, sceneId: sceneId, choices: parseChoices(row.choices), };
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
            if (scene) { setCurrentScene(scene); }
            else { console.error(`Critical Error: Scene ID ${currentSceneId} not found.`); setError(`오류: 장면(ID: ${currentSceneId}) 없음.`); }
        }
    }, [currentSceneId, storyData]);

    // --- 배경 및 BGM 업데이트 (currentScene 변경 시) ---
    useEffect(() => {
        // 배경 스타일을 적용할 요소 가져오기
        const backgroundElement = document.getElementById('game-background');
        const bgmPlayer = document.getElementById('bgm-player');

        if (currentScene && backgroundElement) {
            // --- 배경 이미지 업데이트 ---
            const imageUrl = currentScene.backgroundImage;
            console.log("[Debug] Updating background. Path from data:", imageUrl);
            if (imageUrl) {
                const correctedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
                console.log("[Debug] Corrected image URL:", correctedImageUrl);
                // 이미지 사전 로드 및 적용
                const img = new Image();
                img.onload = () => {
                    console.log("[Debug] Background image preloaded successfully:", correctedImageUrl);
                    // 상태 대신 직접 스타일 적용
                    backgroundElement.style.backgroundImage = `url(${correctedImageUrl})`;
                    backgroundElement.style.backgroundSize = 'cover';
                    backgroundElement.style.backgroundPosition = 'center';
                    backgroundElement.style.backgroundRepeat = 'no-repeat';
                    backgroundElement.style.transition = 'background-image 0.8s ease-in-out'; // 전환 효과
                    backgroundElement.style.backgroundColor = ''; // 배경색 제거
                }
                img.onerror = () => {
                    console.error("[Debug] Failed to preload background image:", correctedImageUrl);
                    backgroundElement.style.backgroundImage = 'none';
                    backgroundElement.style.backgroundColor = '#333'; // 로드 실패 시 기본 배경색
                }
                img.src = correctedImageUrl;
            } else {
                console.log("[Debug] No background image specified.");
                backgroundElement.style.backgroundImage = 'none';
                backgroundElement.style.backgroundColor = '#333'; // 이미지 없을 때 기본 배경색
            }
        } else if (!currentScene) {
             console.log("[Debug] currentScene is null, skipping background update.");
        } else if (!backgroundElement) {
             console.error("[Debug] #game-background element not found!");
        }


        // --- BGM 업데이트 ---
        if (currentScene && bgmPlayer) {
            const musicSrc = currentScene.backgroundMusic;
            console.log("[Debug] Updating BGM. Path from data:", musicSrc);
            const currentSrc = bgmPlayer.getAttribute('src');
            const correctedMusicSrc = musicSrc && !musicSrc.startsWith('/') && !musicSrc.startsWith('http')
                                    ? `/${musicSrc}`
                                    : musicSrc;
            console.log("[Debug] Corrected music URL:", correctedMusicSrc);

            if (correctedMusicSrc && correctedMusicSrc !== currentSrc) {
                console.log("[Debug] Setting new BGM src:", correctedMusicSrc);
                bgmPlayer.src = correctedMusicSrc;
                bgmPlayer.load();
                console.log("[Debug] BGM source set.");
                if (audioContextStarted) {
                     console.log("[Debug] Audio context started, attempting play...");
                     bgmPlayer.play().catch(e => console.warn("[Debug] BGM play prevented:", e));
                } else { console.log("[Debug] Audio context not started, BGM won't autoplay."); }
            } else if (!correctedMusicSrc && currentSrc) {
                console.log("[Debug] Pausing BGM and removing src.");
                bgmPlayer.pause(); bgmPlayer.currentTime = 0; bgmPlayer.removeAttribute('src');
            } else if (correctedMusicSrc && correctedMusicSrc === currentSrc) {
                console.log("[Debug] BGM src is the same.");
                 if (audioContextStarted && bgmPlayer.paused) {
                      console.log("[Debug] Attempting to replay BGM...");
                      bgmPlayer.play().catch(e => console.warn("[Debug] BGM replay prevented:", e));
                 }
            } else { console.log("[Debug] No BGM specified or src is null/empty."); }
        } else if (!bgmPlayer) { console.error("[Debug] #bgm-player element not found!"); }

    }, [currentScene, audioContextStarted]); // audioContextStarted 의존성 유지

    // --- 첫 사용자 인터랙션 시 오디오 컨텍스트 시작 ---
    const handleUserInteraction = useCallback(() => {
        if (audioContextStarted) { console.log("[Debug] Audio context already started."); return; }
        console.log("[Debug] User interaction detected, attempting to start audio context...");
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            try {
                const audioCtx = new AudioContext();
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume().then(() => {
                        console.log("[Debug] AudioContext resumed successfully.");
                        setAudioContextStarted(true);
                        const bgmPlayer = document.getElementById('bgm-player');
                        if (bgmPlayer && bgmPlayer.paused && bgmPlayer.currentSrc) {
                             bgmPlayer.play().catch(e => console.warn("[Debug] BGM play after context resume failed:", e));
                        }
                    }).catch(e => console.error("[Debug] Failed to resume AudioContext:", e));
                } else {
                    console.log("[Debug] AudioContext state:", audioCtx.state);
                    setAudioContextStarted(true);
                    const bgmPlayer = document.getElementById('bgm-player');
                    if (bgmPlayer && bgmPlayer.paused && bgmPlayer.currentSrc) {
                         bgmPlayer.play().catch(e => console.warn("[Debug] BGM play (context already running) failed:", e));
                    }
                }
            } catch (e) {
                 console.error("[Error] Creating AudioContext failed:", e);
                 setAudioContextStarted(true);
            }
        } else {
            console.warn("AudioContext is not supported.");
            setAudioContextStarted(true);
             const bgmPlayer = document.getElementById('bgm-player');
             if (bgmPlayer && bgmPlayer.paused && bgmPlayer.currentSrc) {
                 bgmPlayer.play().catch(e => console.warn("[Debug] BGM play (no AudioContext) failed:", e));
             }
        }
    }, [audioContextStarted]);


    // --- 답변 선택 처리 (오디오 컨텍스트 시작 로직 추가) ---
    const handleChoiceClick = useCallback((nextSceneId) => {
        if (!audioContextStarted) { handleUserInteraction(); }

        if (nextSceneId === null || nextSceneId === undefined) { console.error("Invalid nextSceneId:", nextSceneId); return; }
        if (!storyData.some(scene => scene.sceneId === nextSceneId)) { console.error(`Next scene ID ${nextSceneId} does not exist.`); setError(`오류: 다음 장면(ID: ${nextSceneId}) 없음.`); return; }

        console.log(`Choice clicked! Transitioning to scene ID: ${nextSceneId}`);
        setError(null);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentSceneId(nextSceneId);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 300);
    }, [storyData, handleUserInteraction, audioContextStarted]);

    // --- 렌더링 ---
    if (isLoading) { return <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">로딩 중...</div>; }
    if (error) { return <div className="flex items-center justify-center min-h-screen text-red-500 p-8 bg-gray-900 text-center">{error}</div>; }
    if (!currentScene) { return <div className="flex items-center justify-center min-h-screen text-yellow-500 bg-gray-900">장면 데이터 준비 중...</div>; }

    const questionPosStyle = getPositionStyles(currentScene.questionPosition);
    const choicesPosStyle = getPositionStyles(currentScene.choicesPosition);
    const contentOpacityStyle = { opacity: isTransitioning ? 0 : 1 };
    const transitionClasses = "transition-opacity duration-300 ease-in-out";

    return (
        // 최상위 div에 클릭 이벤트 리스너 추가
        <div id="game-container" className="min-h-screen bg-gray-900 relative overflow-hidden" onClick={handleUserInteraction}>
            {/* 배경 전용 div 추가 */}
            <div
                id="game-background" // ID 변경 (game-body -> game-background)
                className="absolute inset-0 w-full h-full -z-10" // 화면 전체 채우고 뒤로 보내기
                // style={backgroundStyle} // 상태 대신 useEffect에서 직접 설정
            ></div>

            {/* 질문 영역 */}
            <div id="question-container" style={{ ...questionPosStyle, ...contentOpacityStyle }} className={`max-w-[90%] ${transitionClasses}`}>
                {currentScene && ( <Question text={currentScene.question} color={currentScene.questionColor} fontSize={currentScene.questionFontSize} textAlign={currentScene.questionTextAlign} containerStyles={currentScene.questionContainerStyles} /> )}
            </div>
            {/* 답변 영역 */}
            <div id="choices-container" style={{ ...choicesPosStyle, ...contentOpacityStyle }} className={`max-w-[90%] ${transitionClasses} delay-100`}>
                {currentScene && ( <Choices choices={currentScene.choices || []} sceneData={{...currentScene, currentSceneId}} onChoiceClick={handleChoiceClick} alignment={currentScene.choicesAlignment} containerStyles={currentScene.choicesContainerStyles} /> )}
            </div>
             <audio id="bgm-player" loop></audio>
        </div>
    );
}

export default App;
