const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
//const { domainToASCII } = require('url');
// var fs = app.require('fs');
// CARGA TIMELINEJS Y VARIABLES GLOBALES
window.onload = cargaTm;
let contador = 0;
var jsondata;
let mediaUrl;
let mediaCaption;
let mediaCredit;
let dateYearStart;
let dateYearEnd;
let textHead;
let textText;
let isnew = false;

function cargaTm() {
  var additionalOptions = {
    start_at_end: false,
    default_bg_color: { r: 200, g: 200, b: 200 },
    timenav_height: 150
  }
  fetch('timeline3.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      jsondata = JSON.parse(JSON.stringify(data));
      // console.log(jsondata);
      window.timeline = new TL.Timeline('timeline-embed', data, additionalOptions);

      // appendData(data);
    })
    .catch(function (err) {
      console.log(err);
    });
};

// ABRIR MENU
document.getElementById('openmenu').addEventListener("click", (e) => {
  // let ele = e.target.getAttribute("data-bs-toogle");
  // let element = document.querySelector(ele);
  // console.log(element);
  // element.classList.toggle("show");
});

//QUITAR VISOR TIMELINE
function quitarTL() {
  let tmlemb =document.getElementById('cuerpo')

  // if (typeof(tmlemb) != 'undefined' && tmlemb != null){
  //   tmlemb.remove();
  tmlemb.firstElementChild.remove();
};
//MOSTRAR VISOR TIMELINE

//PINTAR FORMULARIO
function pintarForm() {
  let formulario = document.createElement('div');
  formulario.innerHTML = `
    <form id="nform" class="row g-3 mt-2">
  <div class="col-md-6">

    <label for="inputurl" class="form-label">Dirección del Recurso en la Web *</label>
    <input type="text" class="form-control" id="inputurl" required>
    </div>
    <div class="col-md-6">
      <label for="inputcredits" class="form-label">Créditos *</label>
      <input type="text" class="form-control" id="inputcredits" placeholder="Editorial anónima" required>
    </div>
  <div class="col-12">
    <label for="inputcaption" class="form-label">Leyenda/pie de archivo multimedia *</label>
    <input type="text" class="form-control" id="inputcaption" placeholder"Este texto aparecerá bajo el archivo multimedia" required>
  </div>
  
  <div class="col-3">
    <label for="inputStarYear" class="form-label">Año del evento *</label>
    <input type="number" class="form-control" id="inputStarYear" placeholder="Año del evento (no en título)">
  </div>
  <div class="col-3">
    <label for="inputEnYear" class="form-label">Año de finalización del evento</label>
    <input type="number" class="form-control" id="inputEndYear" placeholder="dato no obligatorio">
  </div>

  <div class="col-md-6">
    <label for="inputCabecera" class="form-label">Cabecera *</label>
    <input type="text" class="form-control" id="inputCabecera" placeholder="Esta el la Cabecera del Evento" required>
  </div>
  <div class="col-md-12">
  <label for="inputTextText" class="form-label">Texto Explicativo *</label>
  <textarea class="form-control" id="inputTextText" rows="2" placeholder="Este es un texto resumido del evento" required></textarea>
  </div>
  
  <div class="d-grip gap-4 d-md-flex justify-content-md-center">
      <button id="salvar" type="button" class="btn btn-outline-success">Guardar Evento</button>
      <button id="cancelando" type="button" class="btn btn-outline-primary">Volver a la Presentación</button>
  </div>
  </form>
  <nav aria-label="..." class="mt-4">
    <ul id="paginacion" class="pagination pagination-sm justify-content-center">    
    </ul>
  </nav>
    `
  var cuerpo = document.getElementById('cuerpo');
  cuerpo.appendChild(formulario);
  document.getElementById("salvar").addEventListener('click', function (event) {
    let formul = document.getElementById('nform');
    if (formul.checkValidity()){
      if(isnew){
        saveEvent();
      }else{
        updateevent();
      }
    }else{
      let alerta = document.createElement('div')
      alerta.className="alert alert-danger alert-dismissible fade show";
      alerta.setAttribute("role","alert");
      alerta.innerHTML=`
        Los campos indicados con * son necesarios, también el Año del Evento excepto si es el Título 
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>           
        `
        document.body.appendChild(alerta);
        setTimeout(() => {
          document.querySelector('.alert').remove();
        }, 3000);
    }
    // event.preventDefault();
    // console.log(jsondata.events[0]);
    // alert('estoy aquí!!!');
  });

  document.getElementById("cancelando").addEventListener("click", () => {
    window.location.reload()
  });

  // OBTENER ELEMENTOS
  mediaUrl = document.getElementById('inputurl');
  mediaCaption = document.getElementById('inputcaption');
  mediaCredit = document.getElementById('inputcredits');
  dateYearStart = document.getElementById('inputStarYear');
  dateYearEnd = document.getElementById('inputEndYear');
  textHead = document.getElementById('inputCabecera');
  textText = document.getElementById('inputTextText');

}

//GUARDAR CAMBIOS EN PUNTOTL EXISTENTE
function updateevent() {
  // console.log(jsondata.events[contador]);
  if (contador >= 0) {
    jsondata.events[contador].media.url = mediaUrl.value;
    jsondata.events[contador].media.caption = mediaCaption.value;
    jsondata.events[contador].media.credit = mediaCredit.value;

    jsondata.events[contador].start_date.year = dateYearStart.value;
    if (dateYearEnd.value) {
      // console.log(j)
      if (jsondata.events[contador].end_date !== undefined) {
        jsondata.events[contador].end_date.year = dateYearEnd.value;
      } else {
        const endD = {
          "end_date": {
            "year": dateYearEnd.value
          }
        };
        Object.assign(jsondata.events[contador], endD);
      }
    }
    jsondata.events[contador].text.text = textText.value;
    jsondata.events[contador].text.headline = textHead.value;

  } else {
    jsondata.title.media.url = mediaUrl.value;
    jsondata.title.media.caption = mediaCaption.value;
    jsondata.title.media.credit = mediaCredit.value;
    jsondata.title.text.text = textText.value;
    jsondata.title.text.headline = textHead.value;
  }
  try {
    fs.writeFileSync(path.join(__dirname,"timeline3.json"), JSON.stringify(jsondata), 'utf8');
    let msg;
    (contador>=0)?msg=`El Evento ${textHead.value}`: msg='El Título';
    let alerta = document.createElement('div')
    alerta.className="alert alert-success alert-dismissible fade show";
    alerta.setAttribute("role","alert");
    alerta.innerHTML=`
          ${msg} se ha actualizado correctamente
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `
      document.body.appendChild(alerta);
      setTimeout(() => {
        document.querySelector('.alert').remove();
      }, 3000);
  } catch(err) {
    console.error(err);
  }
}

//GUARDAR PUNTOTL NUEVO
function saveEvent(){

  const nEvent = {
    "media": {
      "url": mediaUrl.value,
      "caption": mediaCaption.value,
      "credit": mediaCredit.value
    },
    "start_date":{
      "year": dateYearStart.value
    },
    "end_date":{
      "year": dateYearEnd.value
    },
    "text":{
      "headline": textHead.value,
      "text": textText.value
    }
}
jsondata.events.push(nEvent);
document.getElementById('nform').reset();
try {
  fs.writeFileSync(path.join(__dirname,"timeline3.json"), JSON.stringify(jsondata), 'utf8');
  let alerta = document.createElement('div')
  alerta.className="alert alert-success alert-dismissible fade show";
  alerta.setAttribute("role","alert");
  alerta.innerHTML=`
        El Evento ${textHead.value} se ha guardado correctamente
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `
    document.body.appendChild(alerta);
    setTimeout(() => {
      document.querySelector('.alert').remove();
    }, 3000);
} catch(err) {
  console.error(err);
}
}

//ELIMINAR PUNTOTL EXISTENTE
function delevent(){
  let alerta = document.createElement('div')
  console.log(contador);
  alerta.setAttribute("role","alert");
  if (contador===-1){
    alerta.className="alert alert-warning alert-dismissible fade show";
    alerta.innerHTML=`
            El Título NO puede ser borrado, sólo modificado.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `
        document.body.appendChild(alerta);
        setTimeout(() => {
          document.querySelector('.alert').remove();
        }, 3000);
        return;
  }else{ 
    jsondata.events.splice(contador,1);
    // console.log(jsondata);
    try {
      fs.writeFileSync(path.join(__dirname,"timeline3.json"), JSON.stringify(jsondata), 'utf8');
      alerta.className="alert alert-success alert-dismissible fade show";
      alerta.innerHTML=`
            El Evento ${textHead.value} se ha borrado correctamente
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `
        document.body.appendChild(alerta);
        setTimeout(() => {
          document.querySelector('.alert').remove();
        }, 3000);
        contador=0;
        let pag = document.getElementById('paginacion')
        const rmvchilds = (parent)=>{
          while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
          }
        };
        rmvchilds(pag);
        paginador(jsondata.events.length)
        fillform(jsondata.events[contador]);
    } catch(err) {
      console.error(err);
    }  
  }
}

//CARGA PAGINADOR
function paginador(num) {
  let formulario = document.getElementById("paginacion");
  let tit = document.createElement('li');
  tit.className = "page-item"
  tit.innerHTML = '<li class="page-item"><a class="page-link" href="#">Título</a></li>'
  formulario.appendChild(tit);
  for (var i = 0; i < num; i++) {
    let li = document.createElement('li');
    li.className = "page-item"
    if (i === 0) {
      li.innerHTML = `
        <li class="page-item active"><a class="page-link" href="#">${i + 1}</a></li>
    `
    } else {
      li.innerHTML = `
        <li class="page-item"><a class="page-link" href="#">${i + 1}</a></li>
    `
    }
    formulario.appendChild(li);
  };
  //Listener sobre el paginador
  document.getElementById("paginacion").addEventListener('click', (e) => {
    var lis = document.querySelectorAll(".pagination > li")
    // console.log(lis[1].firstElementChild.classList.remove("active"));
    // console.log(lis.length);
    lis.forEach(function (hijo) {
      hijo.firstElementChild.classList.remove("active");
    })

    if (e.target.innerHTML == "Título") {
      fillform(jsondata.title)
      contador = -1;
      e.target.parentElement.classList.add("active")
    } else {
      contador = e.target.innerHTML - 1
      fillform(jsondata.events[contador])
      e.target.parentElement.classList.add("active")
      // e.currentTarget.className += " active";
    }
  });

};

// CARGAR PUNTOTL
function fillform(element) {
  mediaUrl.value = element.media.url;
  mediaCaption.value = element.media.caption;
  mediaCredit.value = element.media.credit;
  (element.start_date) ? dateYearStart.value = element.start_date.year : dateYearStart.value = "";
  (element.end_date) ? dateYearEnd.value = element.end_date.year : dateYearEnd.value = "";
  textHead.value = element.text.headline;
  textText.value = element.text.text;
}



///////////////////////UI///////////////////////////
document.getElementById("botonera").addEventListener('click', (e) => {
  if (e.target.id==="editevent"){
    quitarTL();
    pintarForm();
    let btnborrar = document.createElement("button")
    btnborrar.className="btn btn-outline-danger";
    btnborrar.setAttribute("id","borrando");
    btnborrar.setAttribute("type","buton");
    btnborrar.innerHTML="Borrar Evento";
    var prev = document.getElementById("cancelando");
    prev.parentNode.insertBefore(btnborrar, prev.nextSibling);

    document.getElementById("borrando").addEventListener("click", () => {
      delevent();
    });
    paginador(jsondata.events.length)
    fillform(jsondata.events[contador]);
    // console.log(jsondata.events.length);
  }else{
    quitarTL();
    pintarForm();
    isnew = true;
  }

});
