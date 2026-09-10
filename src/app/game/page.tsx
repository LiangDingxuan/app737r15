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
    const [holdPiece, setHoldPiece] = useState(null);
    const [curPiece, setCurPiece] = useState<typeof piecesList[0]|null>(null);
    const [boardState, setBoardState] = useState<BoardCell[][]>(createBoard());
    const [curPiecePos, setCurPiecePos] = useState(()=>(defaultSpawn))
    const [playingState, setPlayingState] = useState(false)
    const [isGrounded, setIsGrounded] = useState(false)
    

    const stateRef = useRef({
        holdPiece, curPiece, boardState, curPiecePos, playingState, queue, isGrounded
    })

    stateRef.current = {
        holdPiece, curPiece, boardState, curPiecePos, playingState, queue, isGrounded
    }

    const handleSetGameState = (isPlaying: boolean) =>{
        setPlayingState(isPlaying)
    }

    const handleStartGame=()=>{
        setPlayingState(true);
        newGame();
    }

    //const { holdPiece, curPiece, boardState, curPiecePos, playingState, queue, isGrounded} = stateRef.current;

    const newGame = () =>{
        setQueue(null)
        setIsGrounded(false);
        newBoard();
        shufflePieces();
    }

    const shufflePieces = () =>{
        const {queue} = stateRef.current;
        const shuffledPieces = [...piecesList];

        if(queue === null || queue.length === 0){
            for(let i=0; i<piecesList.length; i++){
                const piece = Math.floor(Math.random() * (i+1));
                [shuffledPieces[i], shuffledPieces[piece]] = [shuffledPieces[piece], shuffledPieces[i]];
            }
            setQueue(shuffledPieces);
        }
        if(queue===null) return;
        if(queue.length < 8){
            const first7 = queue;
            for(let i=0; i<piecesList.length; i++){
                const piece = Math.floor(Math.random() * (i+1));
                [shuffledPieces[i], shuffledPieces[piece]] = [shuffledPieces[piece], shuffledPieces[i]];
            }
            setQueue([...first7, ...shuffledPieces]);
        }
    }

    const popQueue = () =>{
        const {queue} = stateRef.current;
        if (queue === null){
            shufflePieces();
            return;
        }
        setCurPiecePos(defaultSpawn)
        setCurPiece(queue[0]);
        setQueue(queue.slice(1))
        shufflePieces();
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
        setBoardState(resultLockedBoard);
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

    }

    const handleDas = (direction: number) =>{
        const { curPiece, curPiecePos} = stateRef.current;
        const newX = curPiecePos.x + direction
        if(canPlace(curPiece, newX, curPiecePos.y)){
            setCurPiecePos(prev=>({...prev, x:newX}))
        }
    }

    const handleRotateClockwise = () =>{

    }

    const handleRotateCounterClockwise = () =>{

    }

    const handleHardDrop = () =>{

    }

    const handleHoldPiece = () =>{

    }

    const stopSoftDrop = () =>{

    }

    const stopDas = () =>{

    }

    //setBoardState(getBoard())
    const gameBoard = getBoard()
    
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
                //handleLockPiece();
            }
        },500);
        return () => clearInterval(gameLoop)
    },[playingState])

    //handlelock
    useEffect(()=>{
        if(!isGrounded) return;
        const gameLoop = setInterval(()=>{
            //const {holdPiece, curPiece, boardState, curPiecePos} = stateRef.current;
            if(isGrounded){
                handleLockPiece();
            }
        },500)
        return () => clearInterval(gameLoop)
    },[isGrounded])

    return (
        <>
            <div className="m-8">
                <div className="">
                    <a href="/">Home</a>
                </div>
                <div className="testFunc gap-2 flex flex-row mt-2">
                    <button onClick={()=>popQueue()} className="p-1 border rounded-full text-sm">Pop Queue</button>
                    <button onClick={handleStartGame} className="p-1 border rounded-full text-sm">Start</button>
                </div>
                <div className=" flex flex-row">
                    
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
                            {gameBoard.slice(21,40).map((row, rowIndex) =>(
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
            </div>
        </>
    )
}