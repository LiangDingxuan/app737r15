import {newGame, shufflePieces, newBoard, queue, hold, curPiece, gameBoard} from "./logic";

export default function Game() {
    newGame();
    return (
        <>
        <div className="m-8 flex flex-row">
            <div className="board">
                <div className="topBoard ">
                    {gameBoard.slice(16,20).map((row, rowIndex) =>(
                        <div key={rowIndex} className="flex">
                            {row.map((cell, cellIndex) =>(
                                <div className="h-4 w-4">

                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="bottomBoard border border-white w-max">
                    {gameBoard.slice(21,40).map((row, rowIndex) =>(
                        <div key={rowIndex} className="flex">
                            {row.map((cell, cellIndex)=>(
                                <div className="border border-slate-500 h-4 w-4">

                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="queue gap-4 mt-16 pl-4 border flex flex-col">
                {queue.slice(0,6).map(({name, shape, colour}, pieceIndex) =>(
                    <div key={pieceIndex}className="piece flex flex-col">
                        {shape.map((row, rowIndex)=>(
                            <div key={rowIndex} className="flex">
                                {row.map((cell, cellIndex)=>(
                                    <div key={cellIndex} className="h-4 w-4" style={{
                                    backgroundColor: cell === 1 ? colour : 'transparent',
                                    //height: cell === 1 ? 16 : 0,
                                    //width: cell === 1 ? 16 : 0
                                    }}>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}