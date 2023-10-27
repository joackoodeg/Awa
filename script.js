// firebase.initializeApp({ ... });
const goalElement = document.getElementById('goal');
const currentElement = document.getElementById('current');
const addButton = document.getElementById('addButton');
const timeRemainingElement = document.getElementById('timeRemaining');
const amountInput = document.getElementById('amountInput');
const amountValue = document.getElementById('amountValue');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');
let dataWeek=[]; dataWeek.length = 7; 
let dataWeekSave=[]; 

let lastValue=JSON.parse(localStorage.getItem("lastValue"));
let lastDay=JSON.parse(localStorage.getItem("lastDate"));
let currentAmount = lastValue;

//CAMBIAR DE DIA
function checkDay(){
    const newday= new Date();
    if(newday.getDay()!=lastDay){
        currentAmount=0;
    }
}checkDay();


const dailyGoal = 2000; // en ml

function updateValues() {
    goalElement.textContent = dailyGoal + ' ml';
    currentElement.textContent = currentAmount + ' ml';
    document.dispatchEvent(new Event('currentAmountChanged'));
    console.log(amountInput);
}
updateValues();

function updateProgressBar() {
    const percentage = (currentAmount / dailyGoal) * 100;
    const boundedPercentage = Math.min(percentage, 100); // Limita al 100% 
    progressBar.style.width = '100%';
    progressBar.textContent = boundedPercentage >= 100 ? '+' + (percentage - 100).toFixed(2) + '%' :   boundedPercentage.toFixed(2) + '%';

    // Cambia el color de la barra
    if (boundedPercentage < 100) {
        const red = 255 - Math.round((boundedPercentage / 100) * 255);
        const green = Math.round((boundedPercentage / 100) * 255);
        progressBar.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
    } else {
        progressBar.style.backgroundColor = 'lightblue';
    }

    // Ajusta el contenedor de la barra de progreso si se supera el 100%
    if (percentage > 100) {
        progressBarContainer.style.width = '100%';
    } else {
        progressBarContainer.style.width = 'auto';
    }
}
updateProgressBar();

amountInput.addEventListener('input', function() {
    amountValue.textContent = amountInput.value + ' ml';
});

function addWater(amount) {
    currentAmount += amount;
    updateValues();
    updateProgressBar();
    
    // guardar el valor actual en Firebase para el usuario autenticado
    localStorage.setItem("lastValue",JSON.stringify(currentAmount));
}

addButton.addEventListener('click', function() {
    addWater(0); 
});

function addCustomWater() {
    const amount = parseInt(amountInput.value, 10);
    if (!isNaN(amount) && amount > 0 && amount <= 1000) {
        addWater(amount);
        amountInput.value = '0'; // Restablecer el slider a 0 después d tomar 
        amountValue.textContent = '0 ml'; // Restablecer el valor mostrado
        updateProgressBar();
    } else {
        alert('Ingresa una cantidad válida entre 1 y 1000 ml.');
    }

    console.log(currentAmount)
}
addButton.addEventListener('click', addCustomWater);

function calculateTimeRemaining() {
    const now = new Date();
    const remainingMilliseconds = (23 - now.getHours()) * 3600000 + (60 - now.getMinutes()) * 60000;
    const remainingHours = Math.floor(remainingMilliseconds / 3600000);
    const remainingMinutes = Math.floor((remainingMilliseconds % 3600000) / 60000);
    timeRemainingElement.textContent = `Time remaining: ${remainingHours} h & ${remainingMinutes} m`;
}
calculateTimeRemaining();

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('waterChart').getContext('2d');

    const waterChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['S','M','T','W','T','F','S'],
            datasets: [{
                label: 'Water Taken (ml)',
                data: [0], // Aquí se pasa el valor actual
                backgroundColor: 'rgba(0, 206, 209, 0.5)', // Celeste transparente
                borderColor: 'rgba(0, 206, 209, 1)', // Celeste sólido
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: dailyGoal // Puedes ajustar el máximo según tus necesidades
                }
            }
        }
    });

    document.addEventListener('currentAmountChanged', function() {
        // Actualizar el dato del gráfico con el nuevo currentAmount
        const today = new Date();
        localStorage.setItem("lastDate",JSON.stringify(today.getDay()));
        dataWeek[today.getDay()]=currentAmount;
        localStorage.setItem("dataWeekSave",JSON.stringify(dataWeek));

        //waterChart.data.datasets[0].data[today.getDay()] = currentAmount;
        // Actualizar el gráfico
        
        for(let i=0; i<dataWeek.length; i++){
            waterChart.data.datasets[0].data[i] = dataWeek[i];
            waterChart.update();
        }
    });
   
    function dataSave(){
        dataWeekSave=JSON.parse(localStorage.getItem("dataWeekSave"));
        for(let i=0; i<dataWeekSave.length; i++){
            waterChart.data.datasets[0].data[i] = dataWeekSave[i];
            waterChart.update();
        }
    }      dataSave();
});
