# ChessGame
[Click Here!](https://phinziegler.github.io/ChessGame/)<br>
This is a personal project of mine. Trying to create something to prove my knowledge of Javascript, HTML, and CSS.

## In development and To-Do
1. Check and checkmate detection. 
2. Creating starting positions (already possible with fen, but I would like this to be possible using a more natural menu).
3. Audio preference, and cookie to save preference.
4. Alternative Win condition settings:
    1. Checkmate
    2. Elimination
    3. Pawn journey
5. Preset Game Conditions
    1. nbpnb/20/NBPNB -- protect the pawn
    2. rnbqkbnr/pppppppp/PPPPPPPP/RNBQKBNR -- close quarters
    3. etc
6. Turn indicator

## Known Bugs
1. rnbqkbnr/ppppppPp/8/8/8/8/PPPPPPPP/RNBQKBNR => update => upgrade white pawn => undo => move same white pawn = bizarre bug which i cant figure out. Somehow this allows the move history to have a length greater than 0 in the starting position.. For some reason, the board state is also in a state previous to the board update.
    UPDATE: the source of this bug is in MOVES.js, in the enPassant function. 
