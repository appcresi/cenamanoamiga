/**
 * Se ejecuta en el <head> antes de dibujar la página (evita el destello claro):
 * usa la elección guardada o, si no hay, la preferencia del sistema, y sigue los
 * cambios del sistema mientras el usuario no haya elegido.
 */
export const SCRIPT_TEMA = `(function(){try{
var d=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");
function g(){try{return localStorage.getItem("tema")}catch(e){return null}}
function a(){var t=g();d.dataset.theme=(t?t==="oscuro":m.matches)?"dark":"light"}
a();m.addEventListener("change",function(){if(!g())a()});
}catch(e){}})()`;
