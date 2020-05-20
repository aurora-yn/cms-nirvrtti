/* 
 * ---------------------------------------------
 * Navigation control
 * ---------------------------------------------
 */
const nav = document.getElementById("nav-list");
const title = document.getElementById("nav-title");

const navSelectClass = (() => {
  switch (title.innerHTML) {
    case "Manage Common Component":
      nav.children[0].classList.toggle("selected")
      break;
    case "Manage Page":
      nav.children[1].classList.toggle("selected")
      break;
    case "Manage Design Template":
      nav.children[2].classList.toggle("selected")
      break;
    case "Setting":
      nav.children[3].classList.toggle("selected")
      break;
    default:
      console.log("nothing");
  }
})();