"use client";
import{kicks} from "./kicks";
import{pieces} from "./pieces";
import{board} from "./board";
import{colours} from "./pieces";
import {useEffect, useState, useRef} from "react";

type PieceType = {
    name: string;
    shape: number[][];
    colour: string;
    }
type BoardCell = 0 | keyof typeof colours;

const defaultSpawn = {x:3, y:18}
const overPos = {x:3, y:19}
const createBoard = () : BoardCell[][] => board.Default.map(row => row.map(()=>0 as BoardCell))

export default function Game() {

    const piecesList: PieceType[] = [
        {name:"I", shape:pieces.I, colour:colours.I},
        {name:"O", shape:pieces.O, colour:colours.O},
        {name:"T", shape:pieces.T, colour:colours.T},
        {name:"S", shape:pieces.S, colour:colours.S},
        {name:"Z", shape:pieces.Z, colour:colours.Z},
        {name:"L", shape:pieces.L, colour:colours.L},
        {name:"J", shape:pieces.J, colour:colours.J}
    ]

    const [queue, setQueue] = useState<typeof piecesList|null>(null)
    const [holdPiece, setHoldPiece] = useState<typeof piecesList[0]|null>(null);
    const [curPiece, setCurPiece] = useState<typeof piecesList[0]|null>(null);
    const [boardState, setBoardState] = useState<BoardCell[][]>(createBoard());
    const [curPiecePos, setCurPiecePos] = useState(()=>(defaultSpawn))
    const [playingState, setPlayingState] = useState(false)
    const [isGrounded, setIsGrounded] = useState(false)
    const [lockCount, setLockCount] = useState(0)
    const [holdingState, setHoldingState] = useState(false);
    const [pieceRotationState, setPieceRotationState] = useState("0")

    const pieceRotationStates = ["0", "R", "2", "L"]
    const softIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const dasIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    

    const stateRef = useRef({
        holdPiece, curPiece, boardState, curPiecePos, playingState, queue, isGrounded
    })

    stateRef.current = {
        holdPiece, curPiece, boardState, curPiecePos, playingState, queue, isGrounded
    }


    const handleStartGame=(e: React.MouseEvent<HTMLButtonElement>)=>{
        setPlayingState(true);
        newGame();
        e.currentTarget.blur();
    }

    //const { holdPiece, curPiece, boardState, curPiecePos, playingState, queue, isGrounded} = stateRef.current;

    const newGame = () =>{
        setBoardState(createBoard());
        const firstQueue = shufflePieces();

        setQueue(firstQueue)
        setIsGrounded(false);
        
        
        popQueue();
    }

    const shufflePieces = () =>{
       let shuffled = [...piecesList];

        for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        //setQueue(shuffled);
        return shuffled;
    }

    const popQueue = () =>{
        const {queue} = stateRef.current;
        if (!queue|| queue.length===0){
            return;
        }

        const nextPiece = queue[0];
        let nextQueue = queue.slice(1);

        if (nextQueue.length < 7){
            const newItems = shufflePieces();
            nextQueue = [...nextQueue, ...newItems];
        }
        
        if(!canPlace(nextPiece, overPos.x, overPos.y)){
            //handleStop();
            return;
        }
        setCurPiece(nextPiece);
        setCurPiecePos(defaultSpawn);
        setQueue(nextQueue);
        setLockCount(0);
        setHoldingState(false)
        setIsGrounded(false);
    }
 
    const newBoard = () =>{
        return board.Default;
    }

    const canPlace=(
        piece: typeof curPiece, 
        x: number, 
        y: number, 
        ) =>{
        const { boardState } = stateRef.current;
        if(!piece) return;
        for (let dy = 0; dy < piece.shape.length; dy++){
            for(let dx = 0; dx < piece.shape[dy].length; dx++){
                if(piece.shape[dy][dx] === 0) continue;
                const bx = x + dx;
                const by = y + dy;

                if (bx < 0 || bx >= boardState[0].length || by >= boardState.length) return false;
                if (by >= 0 && boardState[by][bx] !== 0) return false;
            }
        }
        return true;
    }

    const handleLockPiece=()=>{
        const {curPiece, boardState, curPiecePos, isGrounded} = stateRef.current;
        const resultLockedBoard = boardState.map(row => [...row])
        if(!isGrounded) return;
        if (!curPiece) return;
        curPiece.shape.forEach((row,dy)=>{
            row.forEach((cell,dx)=>{
                if (cell === 0 ) return;

                const boardY = curPiecePos.y + dy
                const boardX = curPiecePos.x + dx

                if(
                    boardY >= 0 && 
                    boardY < resultLockedBoard.length &&
                    boardX >= 0 && 
                    boardX < resultLockedBoard[0].length 
                ){
                    resultLockedBoard[boardY][boardX] = curPiece.name as keyof typeof colours
                }
            })
        })

        const clearedBoard = resultLockedBoard.filter(
            row=>!row.every(cell => cell !== 0)
        )

        while(clearedBoard.length < board.Default.length){
            clearedBoard.unshift(Array(10).fill(0))
        }
        setBoardState(clearedBoard);
        setIsGrounded(false);
        popQueue();
    }

    const handleLockPiecewPos=(x:number, y:number)=>{
        const {curPiece, boardState, curPiecePos, isGrounded} = stateRef.current;
        const resultLockedBoard = boardState.map(row => [...row])
        //if(!isGrounded) return;
        if (!curPiece) return;
        curPiece.shape.forEach((row,dy)=>{
            row.forEach((cell,dx)=>{
                if (cell === 0 ) return;

                const boardY = y + dy;
                const boardX = x + dx;

                if(
                    boardY >= 0 && 
                    boardY < resultLockedBoard.length &&
                    boardX >= 0 && 
                    boardX < resultLockedBoard[0].length 
                ){
                    resultLockedBoard[boardY][boardX] = curPiece.name as keyof typeof colours
                }
            })
        })
        
        const clearedBoard = resultLockedBoard.filter(
            row=>!row.every(cell => cell !== 0)
        )

        while(clearedBoard.length < board.Default.length){
            clearedBoard.unshift(Array(10).fill(0))
        }

        setBoardState(clearedBoard);
        setIsGrounded(false);
        popQueue();
    }

    const getBoard = () =>{
        const gameBoard = boardState.map(row => [...row])
        if(curPiece && curPiecePos){
            let ghostY = curPiecePos.y + 1
            while(canPlace(curPiece, curPiecePos.x, ghostY)){
                ghostY += 1
            }
            curPiece.shape.forEach((row,dy) =>{
                row.forEach((cell, dx) =>{
                    if(cell === 1){
                        const boardY = dy + curPiecePos.y
                        const boardX = dx + curPiecePos.x
                        if(
                            boardY >= 0 && 
                            boardX >= 0 && 
                            boardY < gameBoard.length && 
                            boardX < gameBoard[0].length
                        ) {
                            gameBoard[boardY][boardX] = curPiece.name as keyof typeof colours
                        }
                    }

                    if(cell === 1){
                        const boardY = dy + ghostY - 1
                        const boardX = dx + curPiecePos.x
                        if(gameBoard[boardY][boardX]===0){                        
                            gameBoard[boardY][boardX] = "G"+String(curPiece.name) as keyof typeof colours
                        }                    
                    }
                })
            })
        }
        return gameBoard;
    }

    const handleSoftDrop = () =>{
        if (!softIntervalRef.current){
            softIntervalRef.current = setInterval(()=>{
                const { curPiece, curPiecePos} = stateRef.current;
                const newY = curPiecePos.y+1
                if(canPlace(curPiece, curPiecePos.x, newY)){
                    setCurPiecePos(prev=>({...prev, y: newY }))
                }
                else{
                    clearInterval(softIntervalRef.current!);
                    softIntervalRef.current = null;
                    return;
                }
            },40)
        }
    }

    const stopSoftDrop = () =>{
        if(softIntervalRef.current){
            clearInterval(softIntervalRef.current!);
            softIntervalRef.current = null;
            return;
        }
    }

    const handleDas = (direction: number) =>{
        const { curPiece, curPiecePos} = stateRef.current;
        const newX = curPiecePos.x + direction
        if(canPlace(curPiece, newX, curPiecePos.y)){
            setCurPiecePos(prev=>({...prev, x:newX}))
        }
        if(!dasIntervalRef.current){
            dasIntervalRef.current = setInterval(()=>{
                const { curPiece, curPiecePos} = stateRef.current;
                const newX = curPiecePos.x + direction
                if(canPlace(curPiece, newX, curPiecePos.y)){
                    setCurPiecePos(prev=>({...prev, x:newX}))
                }
                else{
                    clearInterval(softIntervalRef.current!);
                    softIntervalRef.current = null;
                    return;
                }
            }, 60)
        }
    }

    const stopDas = () =>{
        if(dasIntervalRef.current){
            clearInterval(dasIntervalRef.current!);
            dasIntervalRef.current = null;
            return;
        }
    }

    const handleRotateClockwise = () =>{
        if(!curPiece) return;
        const prevRotationState = pieceRotationState
        const prevStateIndex = pieceRotationStates.findIndex(state => state === prevRotationState)
        const length = pieceRotationStates.length
        const curRotationState = pieceRotationStates[(prevStateIndex-1+length)%length]
        const tableKey = prevRotationState+">"+curRotationState
        const table = kicks[tableKey as keyof typeof kicks]

        let result: PieceType = {
            name: curPiece.name,
            shape: [],
            colour: curPiece.colour,
        };
        
        //initiate new shape
        for(let y = 0; y < curPiece.shape.length; y++){
            result.shape[y] = []
            for(let x = 0; x < curPiece.shape[y].length ; x++){
                result.shape[y][x] = 0;
            }
        }

        //set new shape
        for(let y = 0; y < curPiece.shape.length; y++){
            for(let x = 0; x < curPiece.shape[y].length ; x++){
                result.shape[x][curPiece.shape.length - y - 1] = curPiece.shape[y][x]
                //console.log(`${y},${x} = ${x},${curPiece.shape.length-y-1}`);
            }
        }
        if(canPlace(result, curPiecePos.x, curPiecePos.y)){
            setCurPiece(result);
            setPieceRotationState(curRotationState);
        }
        
    }

    const handleRotateCounterClockwise = () =>{
        if(!curPiece) return;
        const prevRotationState = pieceRotationState
        const prevStateIndex = pieceRotationStates.findIndex(state => state === prevRotationState)
        const length = pieceRotationStates.length
        const curRotationState = pieceRotationStates[(prevStateIndex+1)%length]
        const tableKey = prevRotationState+">"+curRotationState
        const table = kicks[tableKey as keyof typeof kicks]

        let result: PieceType = {
            name: curPiece.name,
            shape: [],
            colour: curPiece.colour,
        };
        
        //initiate new shape
        for(let y = 0; y < curPiece.shape.length; y++){
            result.shape[y] = []
            for(let x = 0; x < curPiece.shape[y].length ; x++){
                result.shape[y][x] = 0;
            }
        }

        //set new shape
        for(let y = 0; y < curPiece.shape.length; y++){
            for(let x = 0; x < curPiece.shape[y].length ; x++){
                result.shape[curPiece.shape.length-x-1][y] = curPiece.shape[y][x];
            }
        }

        if(canPlace(result, curPiecePos.x, curPiecePos.y)){
            setCurPiece(result);
            setPieceRotationState(curRotationState);
        }
        //setCurPiece(result);
    }

    const handleHardDrop = () =>{
        const {curPiece, curPiecePos} = stateRef.current;
        let newY = curPiecePos.y
        if (!curPiece) return;
        while(canPlace(curPiece, curPiecePos.x, newY)){
            newY+=1
        }
        handleLockPiecewPos(curPiecePos.x, newY-1)
    }

    const handleHoldPiece = () =>{
        if(holdingState) return;
        if(!holdPiece){
            setHoldPiece(curPiece);
            popQueue();
        }
        else{
            const prevPiece = curPiece
            setCurPiece(holdPiece);
            setHoldPiece(prevPiece);
        }
        setCurPiecePos(defaultSpawn);
        setLockCount(0);
        setHoldingState(true);
    }



    //setBoardState(getBoard())
    const gameBoard = getBoard()

    
    useEffect(()=>{
        if (!queue || queue.length===0){
            shufflePieces();
        }
    })

    useEffect(()=>{
        //if (!playingState) return;
        const handleKeyDown = (e: KeyboardEvent) =>{
            if (e.key === 'ArrowLeft') handleDas(-1);
            if (e.key === 'ArrowRight') handleDas(1);
            if (e.key === 'ArrowUp') handleRotateClockwise();
            if (e.key === 'ArrowDown') handleSoftDrop();
            if (e.key === 'z') handleRotateCounterClockwise();
            if (e.key === ' ') handleHardDrop();
            if (e.key === 'Shift') handleHoldPiece();
        }
        const handleKeyUp = (e: KeyboardEvent) =>{
            if (e.key === 'ArrowDown') stopSoftDrop();
            if (e.key === 'ArrowLeft') stopDas();
            if (e.key === 'ArrowRight') stopDas();
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    },[curPiece])

    //gravity
    useEffect(()=>{
        if(!playingState) return;
        const gameLoop = setInterval(()=>{
            const { curPiece, curPiecePos} = stateRef.current;
            const newY = curPiecePos.y + 1
            if(canPlace(curPiece, curPiecePos.x, newY)){
                setCurPiecePos({x:curPiecePos.x, y:newY})
            }
            else{
                setIsGrounded(true);
                setLockCount(lockCount+1);
                //handleLockPiece();
            }
        },500);
        return () => clearInterval(gameLoop)
    },[playingState])

    //handlelock
    useEffect(()=>{
        if(!isGrounded) {
            return;
        }
        if(lockCount >= 15){
            handleLockPiece();
            return;
        }
        const gameLoop = setInterval(()=>{
            //const {holdPiece, curPiece, boardState, curPiecePos} = stateRef.current;
            if(isGrounded){
                handleLockPiece();
            }
        },500)
        return () => clearInterval(gameLoop)
    },[isGrounded, curPiece, curPiecePos])

    return (
        <>
            <div className="m-8 flex flex-row overflow-hidden height-100%">
                <div className="mr-8">
                    <div className="text-center">
                        <a href="/">Home</a>
                    </div>
                    <div className="testFunc gap-2 flex flex-col mt-2">
                        <button onClick={()=>popQueue()} className="p-1 border rounded-full text-sm">Pop Queue</button>
                        <button onClick={handleStartGame} className="p-1 border rounded-full text-sm">Start</button>
                    </div>
                </div>
                <div className=" flex flex-row">
                    <div className="holdPiece mt-16 p-4 border w-max h-max">
                        {holdPiece && (holdPiece.shape.map((row, rowIndex)=>(
                            <div key={rowIndex} className="flex">
                            {row.map((cell, cellIndex) =>(
                                <div key={cellIndex} style={{
                                    backgroundColor: 
                                    cell === 1 ?
                                    holdPiece.colour : 'transparent',
                                    // border: 
                                    // cell === 1 ?
                                    // '1px solid' : ''
                                    //height: cell === 0 ? 0 : 16,
                                    //width: cell === 0 ? 0 : 16
                                }}
                                className="h-4 w-4">
                                    {/* {cell} */}
                                </div>
                            ))}
                            </div>
                        )))
                        }
                    </div>
                    <div className="board">
                        <div className="topBoard ">
                            {gameBoard.slice(16,20).map((row, rowIndex) =>(
                                <div key={rowIndex} className="flex">
                                    {row.map((cell, cellIndex) =>(
                                        <div key={cellIndex} className="h-4 w-4"
                                        style={{
                                            backgroundColor: cell === 0 ? "transparent" : colours[cell]
                                        }}>

                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="bottomBoard border border-white w-max">
                            {gameBoard.slice(20,40).map((row, rowIndex) =>(
                                <div key={rowIndex} className="flex">
                                    {row.map((cell, cellIndex)=>(
                                        <div key={cellIndex} className="border border-slate-500 h-4 w-4" 
                                        style={{
                                            backgroundColor: cell === 0 ? "transparent" : colours[cell]
                                        }}>
                                        
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="queue gap-4 mt-16 pl-4 pt-5 border flex flex-col">
                        {queue?.slice(0,6).map(({name, shape, colour}, pieceIndex) =>(
                            <div key={pieceIndex}className="piece flex flex-col h-8 justify-center">
                                {shape.map((row, rowIndex)=>(
                                    <div key={rowIndex} className="flex">
                                        {row.map((cell, cellIndex)=>(
                                            <div key={cellIndex} className="h-4 w-4" 
                                            style={{
                                            backgroundColor: cell === 1 ? colour : 'transparent',
                                            //height: cell === 0 ? 0 : 16,
                                            //width: cell === 0 ? 0 : 16
                                            }}>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <script
                    async
                    src="https://kilobot.app/widget/v1.js"
                    data-kilobot-widget="pub_6651047dc35c4ea79d32774666c58a13"
                    data-kilobot-mode="ai-powered"
                ></script>
            </div>
            
        </>
    )
}