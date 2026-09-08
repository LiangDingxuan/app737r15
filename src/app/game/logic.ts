import{kicks} from "./kicks";
import{pieces} from "./pieces";
import{board} from "./board";
import{colours} from "./pieces";

type Piece = {
    name: string;
    shape: number[][];
    colour: string;
}
const piecesList: Piece[] = [
    {name:"I", shape:pieces.I, colour:colours.I},
    {name:"O", shape:pieces.O, colour:colours.O},
    {name:"T", shape:pieces.T, colour:colours.T},
    {name:"S", shape:pieces.S, colour:colours.S},
    {name:"Z", shape:pieces.Z, colour:colours.Z},
    {name:"L", shape:pieces.L, colour:colours.L},
    {name:"J", shape:pieces.J, colour:colours.J}
]

const queue:Piece[] = [];
const hold=null;
const curPiece = null;
const gameBoard = board.Default;
const newGame = () =>{
    shufflePieces();
    newBoard();
}
const shufflePieces = () =>{
    const shuffledPieces = [...piecesList];
    if(queue.length === 0){
        for(let i=0; i<piecesList.length; i++){
            const piece = Math.floor(Math.random() * (i+1));
            [shuffledPieces[i], shuffledPieces[piece]] = [shuffledPieces[piece], shuffledPieces[i]];
        }
        queue.push(...shuffledPieces);
    }
    if(queue.length <= 7){
        queue.push(...shuffledPieces);
    }
}
const newBoard = () =>{
    return board.Default;
}

export {newGame, shufflePieces, newBoard, queue, hold, curPiece, gameBoard};