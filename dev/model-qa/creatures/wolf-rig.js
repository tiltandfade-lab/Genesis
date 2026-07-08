/* thin re-export so ps1-sheet.html (which imports from ./creatures/) can render the rigs/ base-rig
   through the REAL engine PS1 shader. The anatomy lives in ../rigs/quadruped.js (buildQuadruped+WOLF). */
export { buildWolfRig } from '../rigs/quadruped.js';
