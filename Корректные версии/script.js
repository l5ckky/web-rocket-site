// Показать справочный блок на странице гидропневматических ракет
document.getElementById('infoButton')?.addEventListener('click', () => {
    const infoBlock = document.getElementById('infoBlock');
    if (infoBlock) {
        infoBlock.classList.toggle('hidden');
    }
});

// Рассчитать радиус парашюта
document.addEventListener('DOMContentLoaded', () => { 
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', () => {
            const massInput = document.getElementById('mass');
            const massUnit = document.getElementById('massUnit');
            const cdSelect = document.getElementById('cd');
            const rhoInput = document.getElementById('rho');
            const velocityInput = document.getElementById('velocity');
            const resultElement = document.getElementById('result');

            // Проверяем, что все элементы существуют
            if (!massInput || !massUnit || !cdSelect || !rhoInput || !velocityInput || !resultElement) {
                alert('Ошибка: Не все элементы доступны на странице!');
                return;
            }

            // Собираем данные из полей
            let mass = parseFloat(massInput.value);
            const massUnitValue = massUnit.value;
            const cd = parseFloat(cdSelect.value);
            const rho = parseFloat(rhoInput.value);
            const velocity = parseFloat(velocityInput.value);

            // Преобразуем массу в кг, если выбраны граммы
            if (massUnitValue === 'g') {
                mass /= 1000;
            }

            // Проверяем корректность данных
            if (isNaN(mass) || isNaN(cd) || isNaN(rho) || isNaN(velocity)) {
                resultElement.textContent = 'Ошибка: Введите корректные данные!';
                return;
            }

            // Константы
            const g = 9.8;

            // Выполняем расчет площади парашюта
            const area = (2 * mass * g) / (rho * cd * Math.pow(velocity, 2));

            // Учитываем вырез в центре (1/15 от площади)
            const effectiveArea = area * (14 / 15);

            // Вычисляем радиус парашюта с учетом выреза
            const radius = Math.sqrt(effectiveArea / Math.PI);

            // Отображаем результат
            resultElement.innerHTML = `
                Результаты расчета: 
                Площадь парашюта без выреза: ${area.toFixed(2)} м² 
                Эффективная площадь с учетом выреза: ${effectiveArea.toFixed(2)} м² 
                Радиус парашюта: ${radius.toFixed(2)} метров
            `;
        });
    } else {
        console.error('Кнопка "Рассчитать радиус" не найдена!');
    }
});

// Расчет плотности воздуха
document.addEventListener('DOMContentLoaded', () => {
    const calculateRhoButton = document.getElementById('calculateRhoButton');
    const rhoInput = document.getElementById('rho');

    if (calculateRhoButton && rhoInput) {
        calculateRhoButton.addEventListener('click', () => {
            // Проверяем поддержку геолокации
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const altitude = position.coords.altitude || 0;
                        if (altitude === 0) {
                            alert('Ваша высота над уровнем моря не определена. Пожалуйста, введите её вручную.');
                            const manualAltitude = parseFloat(prompt('Введите высоту над уровнем моря (в метрах):'));
                            if (isNaN(manualAltitude)) {
                                alert('Ошибка: Введите корректную высоту!');
                                return;
                            }
                            calculateDensity(manualAltitude);
                        } else {
                            calculateDensity(altitude);
                        }
                    },
                    (error) => {
                        alert('Не удалось определить вашу геопозицию. Введите высоту вручную.');
                        const altitude = parseFloat(prompt('Введите высоту над уровнем моря (в метрах):'));
                        if (isNaN(altitude)) {
                            alert('Ошибка: Введите корректную высоту!');
                            return;
                        }
                        calculateDensity(altitude);
                    }
                );
            } else {
                alert('Геолокация недоступна. Введите высоту вручную.');
                const altitude = parseFloat(prompt('Введите высоту над уровнем моря (в метрах):'));
                if (isNaN(altitude)) {
                    alert('Ошибка: Введите корректную высоту!');
                    return;
                }
                calculateDensity(altitude);
            }
        });
    } else {
        console.error('Кнопка "Рассчитать плотность воздуха" или поле "rho" не найдены!');
    }
});

// Функция для расчета плотности воздуха
function calculateDensity(altitude) {
    const temperature = parseFloat(prompt('Введите температуру воздуха (в градусах Цельсия):'));
    if (isNaN(temperature)) {
        alert('Ошибка: Введите корректную температуру!');
        return;
    }

    const T = temperature + 273.15; // Температура в Кельвинах
    const P = 101325 * Math.pow(1 - 0.0000225577 * altitude, 5.25588); // Давление в Па
    const rho = P / (287.058 * T); // Плотность воздуха

    // Обновляем значение плотности в поле ввода
    const rhoInput = document.getElementById('rho');
    if (rhoInput) {
        rhoInput.value = rho.toFixed(3);
    } else {
        alert(`Плотность воздуха: ${rho.toFixed(3)} кг/м³`);
    }
}

// Инициализация Three.js
let scene, camera, renderer, coneMesh;

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 400);
    document.getElementById('3d-view').appendChild(renderer.domElement);

    camera.position.z = 200;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10).normalize();
    scene.add(light);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

function createConeGeometry(data) {
    if (!scene) return;

    if (coneMesh) scene.remove(coneMesh);

    const { baseDiameter, height, shape, wallThickness, couplerDiameter, couplerHeight, centerHoleDiameter } = data;

    if ([baseDiameter, height, wallThickness, couplerDiameter, couplerHeight, centerHoleDiameter].some(isNaN)) {
        console.error("Некоторые входные параметры содержат NaN:", data);
        return;
    }

    const outerRadius = baseDiameter / 2;
    const innerRadius = outerRadius - wallThickness;
    const couplerRadius = couplerDiameter / 2;
    const holeRadius = centerHoleDiameter / 2;

    const outerGeometry = createNoseConeGeometry(outerRadius, height, shape);
    const innerGeometry = createNoseConeGeometry(innerRadius, height, shape);
    const couplerGeometry = new THREE.CylinderGeometry(couplerRadius, couplerRadius, couplerHeight, 32);
    const holeGeometry = new THREE.CylinderGeometry(holeRadius, holeRadius, couplerHeight + 1, 32);

    if (!outerGeometry || !innerGeometry || !couplerGeometry || !holeGeometry) {
        console.error("Ошибка при создании геометрии");
        return;
    }

    outerGeometry.translate(0, couplerHeight, 0);
    innerGeometry.translate(0, couplerHeight, 0);
    couplerGeometry.translate(0, couplerHeight / 2, 0);
    holeGeometry.translate(0, couplerHeight / 2, 0);

    const geometries = [outerGeometry, innerGeometry, couplerGeometry, holeGeometry];

    const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries, false);
    if (!mergedGeometry) {
        console.error("Ошибка объединения геометрий.");
        return;
    }

    mergedGeometry.computeBoundingSphere();
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    coneMesh = new THREE.Mesh(mergedGeometry, material);
    scene.add(coneMesh);
}

function createNoseConeGeometry(radius, height, shape) {
    const points = [];
    const segments = 32;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        let x = radius * (1 - t);
        let y = height * t;

        if (shape === 'ogive') {
            let underRoot = radius ** 2 - ((radius * (1 - t)) ** 2);
            x = underRoot >= 0 ? Math.sqrt(underRoot) : 0;
        } else if (shape === 'parabolic') {
            x = radius * (1 - t ** 2);
        }

        if (isNaN(x) || isNaN(y)) {
            console.error(`Некорректные координаты в сегменте ${i}: x = ${x}, y = ${y}`);
            continue;
        }
        points.push(new THREE.Vector2(x, y));
    }

    return new THREE.LatheGeometry(points, 32);
}

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const downloadButton = document.getElementById('download-button');

    if (generateButton && downloadButton) {
        generateButton.addEventListener('click', () => {
            const modelData = {
                baseDiameter: parseFloat(document.getElementById('base-diameter').value) || 50,
                height: parseFloat(document.getElementById('height').value) || 100,
                shape: document.getElementById('shape').value || 'cone',
                wallThickness: parseFloat(document.getElementById('wall-thickness').value) || 2,
                couplerDiameter: parseFloat(document.getElementById('coupler-diameter').value) || 40,
                couplerHeight: parseFloat(document.getElementById('coupler-height').value) || 20,
                centerHoleDiameter: parseFloat(document.getElementById('center-hole-diameter').value) || 10
            };
            createConeGeometry(modelData);
            downloadButton.disabled = false;
        });

        downloadButton.addEventListener('click', () => {
            if (!coneMesh) return;
            const exporter = new THREE.STLExporter();
            const stlData = exporter.parse(scene);
            const blob = new Blob([stlData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'nose-cone.stl';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    initThreeJS();
});