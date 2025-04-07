const btn = document.querySelector(".card-btn");
const toChange = document.querySelectorAll(".toChange")
let Video = false;

btn.addEventListener("click", change);

function change(){
   if(Video == false){
    Video = true;
    toChange.forEach((slide, index)=>{
      slide.style.transform = `translateX(-${index*100}%)`;
    });
   } else{
    Video = false;
    toChange.forEach((slide, index)=>{
      slide.style.transform = `translateX(${index*100}%)`;
    });
   }
}