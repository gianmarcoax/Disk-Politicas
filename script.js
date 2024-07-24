// Implementación de los algoritmos
function fcfs(requests, initialPosition) {
    let sequence = [initialPosition, ...requests];
    return sequence;
}

function sstf(requests, initialPosition) {
    let sequence = [initialPosition];
    let remainingRequests = [...requests];
    let currentPosition = initialPosition;

    while (remainingRequests.length > 0) {
        let nearestIndex = 0;
        let minDistance = Math.abs(remainingRequests[0] - currentPosition);

        for (let i = 1; i < remainingRequests.length; i++) {
            let distance = Math.abs(remainingRequests[i] - currentPosition);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }

        currentPosition = remainingRequests[nearestIndex];
        sequence.push(currentPosition);
        remainingRequests.splice(nearestIndex, 1);
    }

    return sequence;
}

function scan(requests, initialPosition, diskSize, direction) {
    let sequence = [initialPosition];
    let sortedRequests = [...requests].sort((a, b) => a - b);
    let startIndex = sortedRequests.findIndex(r => r >= initialPosition);

    if (direction === 'ascendente') {
        // Mover hacia la derecha
        for (let i = startIndex; i < sortedRequests.length; i++) {
            sequence.push(sortedRequests[i]);
        }

        // Llegar al final del disco
        if (sequence[sequence.length - 1] !== diskSize - 1) {
            sequence.push(diskSize - 1);
        }

        // Cambiar dirección y mover hacia la izquierda
        for (let i = startIndex - 1; i >= 0; i--) {
            sequence.push(sortedRequests[i]);
        }
    } else {
        // Mover hacia la izquierda
        for (let i = startIndex - 1; i >= 0; i--) {
            sequence.push(sortedRequests[i]);
        }

        // Llegar al inicio del disco
        if (sequence[sequence.length - 1] !== 0) {
            sequence.push(0);
        }

        // Cambiar dirección y mover hacia la derecha
        for (let i = startIndex; i < sortedRequests.length; i++) {
            sequence.push(sortedRequests[i]);
        }
    }

    return sequence;
}

function cscan(requests, initialPosition, diskSize, direction) {
    let sequence = [initialPosition];
    let sortedRequests = [...requests].sort((a, b) => a - b);
    let startIndex = sortedRequests.findIndex(r => r >= initialPosition);

    if (direction === 'ascendente') {
        // Mover hacia la derecha
        for (let i = startIndex; i < sortedRequests.length; i++) {
            sequence.push(sortedRequests[i]);
        }

        // Llegar al final del disco y volver al inicio
        if (sequence[sequence.length - 1] !== diskSize - 1) {
            sequence.push(diskSize - 1);
        }
        sequence.push(0);

        // Continuar desde el inicio hasta el inicio de las solicitudes
        for (let i = 0; i < startIndex; i++) {
            sequence.push(sortedRequests[i]);
        }
    } else {
        // Mover hacia la izquierda
        for (let i = startIndex - 1; i >= 0; i--) {
            sequence.push(sortedRequests[i]);
        }

        // Llegar al inicio del disco y volver al final
        if (sequence[sequence.length - 1] !== 0) {
            sequence.push(0);
        }
        sequence.push(diskSize - 1);

        // Continuar desde el final hasta el inicio de las solicitudes
        for (let i = sortedRequests.length - 1; i >= startIndex; i--) {
            sequence.push(sortedRequests[i]);
        }
    }

    return sequence;
}

function look(requests, initialPosition, direction) {
    let sequence = [initialPosition];
    let sortedRequests = [...requests].sort((a, b) => a - b);

    if (direction === 'ascendente') {
        for (let request of sortedRequests) {
            if (request >= initialPosition) {
                sequence.push(request);
            }
        }
        for (let i = sortedRequests.length - 1; i >= 0; i--) {
            if (sortedRequests[i] < initialPosition) {
                sequence.push(sortedRequests[i]);
            }
        }
    } else {
        for (let i = sortedRequests.length - 1; i >= 0; i--) {
            if (sortedRequests[i] <= initialPosition) {
                sequence.push(sortedRequests[i]);
            }
        }
        for (let request of sortedRequests) {
            if (request > initialPosition) {
                sequence.push(request);
            }
        }
    }

    return sequence;
}

function clook(requests, initialPosition, direction) {
    let sequence = [initialPosition];
    let sortedRequests = [...requests].sort((a, b) => a - b);

    if (direction === 'ascendente') {
        let rightSide = sortedRequests.filter(r => r >= initialPosition);
        let leftSide = sortedRequests.filter(r => r < initialPosition);

        sequence.push(...rightSide);
        sequence.push(...leftSide);
    } else {
        let leftSide = sortedRequests.filter(r => r <= initialPosition);
        let rightSide = sortedRequests.filter(r => r > initialPosition);

        sequence.push(...leftSide.reverse());
        sequence.push(...rightSide.reverse());
    }

    return sequence;
}

// Función para calcular las diferencias entre movimientos
function calculateDifferences(sequence, diskSize) {
    let totalDifference = 0;
    let differences = [];
    for (let i = 1; i < sequence.length; i++) {
        let diff = Math.abs(sequence[i] - sequence[i-1]);
        if (sequence[i-1] === diskSize - 1 && sequence[i] === 0) {
            diff = 1;  // Ajuste para el movimiento de 199 a 0 en C-SCAN
        }
        differences.push({from: sequence[i-1], to: sequence[i], difference: diff});
        totalDifference += diff;
    }
    let averageDifference = totalDifference / (sequence.length - 1);
    return { total: totalDifference, average: averageDifference, differences: differences };
}

let chart; // Variable global para almacenar la instancia del gráfico

// Función para crear o actualizar el gráfico
function createOrUpdateChart(data) {
    const ctx = document.getElementById('chart').getContext('2d');
    
    // Encuentra la longitud máxima de todas las secuencias
    const maxLength = Math.max(...data.datasets.map(d => d.data.length));
    
    // Crea las etiquetas para el eje X basadas en la longitud máxima
    const labels = Array.from({length: maxLength}, (_, i) => i.toString());
    
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets = data.datasets;
        chart.update();
    } else {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: data.datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Posición en el disco'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Secuencia de solicitudes'
                        }
                    }
                }
            }
        });
    }
}

// Función principal para calcular y mostrar resultados
function calculateAndDisplay() {
    const diskSize = parseInt(document.getElementById('diskSize').value);
    const initialPosition = parseInt(document.getElementById('initialPosition').value);
    const requests = document.getElementById('requestsInput').value.split(',').map(Number);
    const timeUnit = parseFloat(document.getElementById('timeUnit').value);
    const direction = document.getElementById('direction').value;

    const algorithms = [
        { name: 'FCFS', func: fcfs },
        { name: 'SSTF', func: sstf },
        { name: 'SCAN', func: (r, i) => scan(r, i, diskSize, direction) },
        { name: 'C-SCAN', func: (r, i) => cscan(r, i, diskSize, direction) },
        { name: 'LOOK', func: (r, i) => look(r, i, direction) },
        { name: 'C-LOOK', func: (r, i) => clook(r, i, direction) }
    ];

    const results = algorithms.map(alg => {
        const sequence = alg.func(requests, initialPosition);
        const { total, average, differences } = calculateDifferences(sequence, diskSize);
        return {
            name: alg.name,
            sequence: sequence,
            totalMovement: total,
            averageMovement: average,
            differences: differences
        };
    });

    // Actualizar la tabla de resultados
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    results.forEach(result => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = result.name;
        row.insertCell(1).textContent = (result.totalMovement * timeUnit).toFixed(2);
        row.insertCell(2).textContent = (result.averageMovement * timeUnit).toFixed(2);
    });

    // Crear datos para el gráfico
    const chartData = {
        datasets: results.map((result, index) => ({
            label: result.name,
            data: result.sequence,
            borderColor: `hsl(${index * 60}, 70%, 50%)`,
            fill: false
        }))
    };

    createOrUpdateChart(chartData);

    // Crear tabla con diferencias de cada movimiento
    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';
    results.forEach((result, index) => {
        const detailTable = document.createElement('table');
        detailTable.classList.add('table', 'table-striped', `table-color-${index}`);

        const detailHeader = detailTable.createTHead();
        const headerRow = detailHeader.insertRow();
        headerRow.insertCell(0).textContent = 'Desde';
        headerRow.insertCell(1).textContent = 'Hasta';
        headerRow.insertCell(2).textContent = 'Diferencia';

        const detailBody = detailTable.createTBody();
        result.differences.forEach(diff => {
            const row = detailBody.insertRow();
            row.insertCell(0).textContent = diff.from;
            row.insertCell(1).textContent = diff.to;
            row.insertCell(2).textContent = (diff.difference * timeUnit).toFixed(2);
        });

        const title = document.createElement('h3');
        title.textContent = result.name;
        detailsContainer.appendChild(title);
        detailsContainer.appendChild(detailTable);
    });
}

// Función para importar solicitudes desde un archivo
function importRequests(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const requests = content.split(',').map(num => num.trim());
            document.getElementById('requestsInput').value = requests.join(',');
            calculateAndDisplay(); // Actualizar gráfico y resultados automáticamente
        };
        reader.readAsText(file);
    }
}

// Agregar eventos a los elementos
document.getElementById('calculateBtn').addEventListener('click', calculateAndDisplay);
document.getElementById('fileInput').addEventListener('change', importRequests);
document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());

// Agregar eventos para actualización automática
['diskSize', 'initialPosition', 'requestsInput', 'timeUnit', 'direction'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateAndDisplay);
});

// Calcular y mostrar resultados iniciales
calculateAndDisplay();
    