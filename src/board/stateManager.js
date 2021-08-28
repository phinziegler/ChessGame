// MANAGES THE STATE OF THE BOARD

import Pawn from "../pieces/pawn.js";
import Bishop from "../pieces/bishop.js";
import Knight from "../pieces/knight.js";
import Rook from "../pieces/rook.js";
import Queen from "../pieces/queen.js";
import King from "../pieces/king.js";
import ChessTile from "./tile.js";
import MessageBoard from "../messageBoard.js";

export default class ChessStateManager {
    constructor(board) {
        this.turn = 'white';
        this.state = [];
        this.board = board;
        this.highlighted = [];  // and array of highlighted DIVS
        this.stateHistory = []; // array holding all previous states of the game.
        this.movesThisTurn = 0;
        this.movesPerTurn = 1;
        this.enPassantTiles = [];
    }


    ///////////////////////////
    /// SETTERS AND GETTERS ///
    ///////////////////////////
    getTurn() {
        return this.turn;
    }
    getBoard() {
        return this.board;
    }
    getState() {
        return this.state;
    }
    getTile(index) {
        let maxPos = (this.board.getColumns() * this.board.getRows());
        if (index < maxPos && index >= 0) {
            return this.state[index];
        }
        return new ChessTile(-1, null); // impossible tile posiiton with null piece
    }
    getTileFromDiv(div) {
        let reg = /\d+/;
        let index = Number(div.id.match(reg)[0]);
        return this.state[index];
    }
    getDivFromIndex(index) {
        let div = document.getElementById("chessBoardTile" + index);
        return div;
    }
    getPieceColor(index) {
        return this.getTile(index).getPiece().getColor();
    }
    getRow(index) {
        return Math.floor(index / this.board.getColumns());  // return the index of the row
    }
    getColumn(index) {
        let col = (index % this.board.getColumns());
        //console.log(index + " is in column " + col);
        return col; // return the index of the column
    }
    pieceTurn(index) {   // returns true when the selected tile belongs to the team whos turn it is to move.
        if (this.state[index].getPiece().getColor() == this.turn) {
            return true;
        }
        return false;
    }
    nextTeam() {
        if (this.movesThisTurn < this.movesPerTurn) {    // when the game allows for many moves per turn, and the total amount of moves is less than that amount, dont change team turn;
            return;
        }
        this.movesThisTurn = 0;
        if (this.turn == 'white') {
            this.turn = 'black';
            return;
        }
        this.turn = 'white';
        return;
    }
    incrementMoves() {
        this.movesThisTurn++;
    }


    //////////////////////////
    /// MOVEMENT FUNCTIONS /// 
    //////////////////////////

    tryMove(currPos, newPos) {
        if (!this.pieceTurn(currPos)) {
            return false;
        }
        let piece = this.state[currPos].getPiece();

        if (piece.getValidMoves().includes(newPos)) {   // piece could MOVE to attempted location
            this.move(currPos, newPos, false, null);
            return true;
        }
        if (piece.getValidTakes().includes(newPos)) {   // piece could TAKE at attempted location
            let takeName = this.state[newPos].getPiece().getName();
            this.move(currPos, newPos, true, takeName);
            return true;
        }
        return false;
    }

    // MOVE TO BOARD
    highlightMoves(currPos) {
        let piece = this.state[currPos].getPiece();
        piece.generateMoves(currPos);

        let div = this.getDivFromIndex(currPos);
        div.className = div.className + " highTile";
        this.highlighted.push(div);

        let moves = piece.getValidMoves();
        moves = moves.concat(piece.getValidTakes());

        let takes = piece.getValidTakes();

        // moves and takes
        for (let i = 0; i < moves.length; i++) {
            div = this.getDivFromIndex(moves[i]);
            if (div != null) {
                this.highlighted.push(div);
                div.className = div.className + " highTile";
            }
        }

        // takes only
        for (let i = 0; i < takes.length; i++) {
            div = this.getDivFromIndex(takes[i]);
            if (div != null) {
                this.highlighted.push(div);
                div.className = div.className + " underAttack";
            }
        }
        this.board.update(this.state);

    }
    // MOVE TO BOARD
    unhighlight() {
        for (let i = 0; i < this.highlighted.length; i++) {
            let div = this.highlighted[i];
            div.className = div.className.replace(' highTile', '');
            div.className = div.className.replace(' underAttack', '');
        }
    }

    // move: alter the game state and display the message
    move(currPos, newPos, isTake, takeName) {
        this.incrementMoves();
        this.nextTeam();    // change which team moves next;

        MessageBoard.moveMessage(this.state[currPos].getPiece(), currPos, newPos, this.board.getColumns(), this.board.getColumns(), isTake, takeName);

        this.state[currPos].getPiece().setMoved(true);

        this.state[newPos].setPiece(this.state[currPos].getPiece());    // new position gets its piece set to the same as the current
        this.state[currPos].setPiece(null);                             // the current position (old position) has its piece set to null.

        this.board.update(this.state);
        this.stateHistory.push(this.genFen(this.state));

        console.log('made move' + currPos + '-' + newPos);
    }


    //////////////////////////
    /// GENERATION METHODS /// -- MOVE TO NEW CLASS
    //////////////////////////

    // generateFen() -- generate a fen string based on an input state
    genFen(state) {
        let output = "";
        for (let i = 0; i < state.length; i++) {
            //console.log(state[i]);
            let curr = state[i];
            let toAdd;      // string to add to FEN.
            //console.log(i);
            // has Piece
            if (curr.hasPiece()) {
                toAdd = curr.getPiece().getTag();
                if (curr.getPiece().getColor() == 'black') {
                    toAdd = toAdd.toLowerCase();
                }
            }
            // no piece
            else {
                toAdd = '/1';
            }
            output = output + toAdd;
        }
        return output;
    }



    // generate a tile array based on an input FEN string.
    fenGen(FEN) {
        try {
            let output = [];
            let fen = FEN;
            let reg = /^\d+|^[A-Za-z]/;
            while (fen.length > 0) {
                if (fen[0] == '/') {
                    fen = fen.substring(1);
                }
                else {
                    let match = fen.match(reg);
                    let code = match[0];
                    if (isNaN(code)) {
                        fen = fen.substring(1);
                        this.#addPiece(output, code);
                    }
                    else {
                        fen = fen.substring(code.length);
                        this.#fillBlanks(output, Number(code));
                    }
                }
            }
            if (output.length != (this.board.getRows() * this.board.getColumns())) {
                throw new Error("FEN code invalid for board");
            }
            this.state = output;
        }
        catch {
            this.fenGen((this.board.getColumns() * this.board.getRows()) + "");
        }
    }
    #fillBlanks(input, num) {   // helper for fengen()
        for (let i = 0; i < num; i++) {
            input.push(new ChessTile(input.length, null));
        }
    }
    #addPiece(input, code) {    // helper for fengen()
        let piece;
        let color = 'black';
        if (code == code.toUpperCase()) {    // is uppercase
            color = 'white';
        }
        let test = code.toLowerCase();

        switch (test) {
            case 'r':
                piece = new Rook(color, this);
                break;
            case 'b':
                piece = new Bishop(color, this);
                break;
            case 'n':
                piece = new Knight(color, this);
                break;
            case 'k':
                piece = new King(color, this);
                break;
            case 'p':
                piece = new Pawn(color, this);
                break;
            case 'q':
                piece = new Queen(color, this);
                break;
        }
        input.push(new ChessTile(input.length, piece));
    }
}
