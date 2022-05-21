class Point {
    constructor (x, y) {
        this.x = x
        this.y = y
    }
}

function interpolation(pointA, pointB, t) {
    return new Point(pointA.x*(1-t) + pointB.x*t, pointA.y*(1-t) + pointB.y*t)
}

function deCasteljau(points, t) {
    const grade = points.length - 1
    if(grade === 1) {
        return interpolation(points[0], points[1], t)
    } else {
        const auxPoints = []
        for(let i = 0; i < grade; i++) {
            auxPoints.push(interpolation(points[i], points[i+1], t))
        }
        return deCasteljau(auxPoints, t)
    }
}

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const rect = canvas.getBoundingClientRect();

const createNewCurveButton = document.getElementById('btn-create-curve')
const deleteCurveButton = document.getElementById('btn-delete-curve')
const nextCurveButton = document.getElementById('btn-next-curve')
const previousCurveButton = document.getElementById('btn-previous-curve')

const createNewPointButton = document.getElementById('btn-create-point')
const deletePointButton = document.getElementById('btn-delete-point')
const editPointButton = document.getElementById('btn-edit-point')
const nextPointButton = document.getElementById('btn-next-point')
const previousPointButton = document.getElementById('btn-previous-point')

const checkBoxCurves = document.getElementById('btn-show-curves')
const checkBoxPolygonal = document.getElementById('btn-show-polygonal')
const checkBoxPoints = document.getElementById('btn-show-points')
const evaluationsInput = document.getElementById('evaluations')

const POINT_RADIUS = 2

const curves = []
var selectedCurve = -1
var selectedPoint = []
selectedPoint.push(0)
var evaluationsNumber = 100

var canvasState = 0 // 1 - adding; 2 - replacing
var click = false
var apparentPoints = true
var apparentPolygonal = true
var apparentCurves = true

// Draw functions
function drawPoint(pointA) {
    context.beginPath()
    context.arc(pointA.x, pointA.y, POINT_RADIUS, 0, 2*Math.PI)
    context.stroke()
}

function drawLine(pointA, pointB) {
    context.beginPath()
    context.lineTo(pointA.x, pointA.y)
    context.lineTo(pointB.x, pointB.y)
    context.strokeStyle = '3px'
    context.stroke()
}

function drawControlPolygon(points) {
    for(let i = 0; i < points.length - 1; i++) {
        drawLine(points[i], points[i+1])
    }
}

function drawBezierCurve(points) {
    if(points.length > 2) {
        const bezierCurves = [];
        bezierCurves.push(points[0])
        for(let i = 1; i <= evaluationsNumber - 2; i++) {
            bezierCurves.push(deCasteljau(points, i/evaluationsNumber))
        }
        bezierCurves.push(points[points.length - 1])
        drawControlPolygon(bezierCurves)
    }
}

function reDraw() {
    context.clearRect(0, 0, canvas.width, canvas.height)
    if(apparentPoints) {
        for(let i = 0; i < curves.length; i++) {
            for(let j = 0; j < curves[i].length; j++) {
                if(j === selectedPoint[selectedCurve] && i === selectedCurve) {
                    context.strokeStyle = 'yellow'
                } else {
                    context.strokeStyle = 'green'
                }
                drawPoint(curves[i][j])
            }
        }
    }
    if(apparentPolygonal) {
        for(let i = 0; i < curves.length; i++) {
            if(i === selectedCurve) {
                context.strokeStyle = 'white'
            } else {
                context.strokeStyle = 'grey'
            }
            drawControlPolygon(curves[i])
        }
    }
    if(apparentCurves && evaluationsNumber > 1) {
        for(let i = 0; i < curves.length; i++) {
            if(i === selectedCurve) {
                context.strokeStyle = 'red'
            } else [
                context.strokeStyle = 'blue'
            ]
            drawBezierCurve(curves[i])
        }
    }
}

canvas.addEventListener('mousedown', function(event) {
    click = true
    const elementRelativeX = event.clientX - rect.left;
    const elementRelativeY = event.clientY - rect.top;
    const canvasRelativeX = elementRelativeX * canvas.width / rect.width;
    const canvasRelativeY = elementRelativeY * canvas.height / rect.height;
    const pointA = new Point(canvasRelativeX, canvasRelativeY)
    if(canvasState === 1) {
        curves[selectedCurve].push(pointA)
    } else if(canvasState === 2) {
        curves[selectedCurve].splice(selectedPoint[selectedCurve], 1, pointA)
    }
    reDraw()
})
canvas.addEventListener('mousemove', function(event) {
    if(click) {
        if(canvasState === 2) {
            const elementRelativeX = event.clientX - rect.left;
            const elementRelativeY = event.clientY - rect.top;
            const canvasRelativeX = elementRelativeX * canvas.width / rect.width;
            const canvasRelativeY = elementRelativeY * canvas.height / rect.height;
            const pointA = new Point(canvasRelativeX, canvasRelativeY)
            curves[selectedCurve].splice(selectedPoint[selectedCurve], 1, pointA)
        }
    }
    reDraw()
})
canvas.addEventListener('mouseup', function(event) {
    click = false
    reDraw()
})

createNewCurveButton.addEventListener('click', function(event) {
    if(selectedCurve === -1 || curves[selectedCurve]?.length > 1) {
        canvasState = 1
        const newCurve = []
        curves.push(newCurve)
        selectedPoint.push(0)
        selectedCurve++
    }
})
deleteCurveButton.addEventListener('click', function(event) {
    if(curves.length > 0) {
        curves.splice(selectedCurve, 1)
        selectedPoint.splice(selectedCurve, 1)
        if(selectedCurve > 0) {
            selectedCurve--
        }
        reDraw()
    } 
})
nextCurveButton.addEventListener('click', function(event) {
    if(selectedCurve < curves.length - 1) {
        selectedCurve++
        reDraw()
    }
})
previousCurveButton.addEventListener('click', function(event) {
    if(selectedCurve > 0) {
        selectedCurve--
        reDraw()
    }
})

createNewPointButton.addEventListener('click', function(event) {
    canvasState = 1
})
deletePointButton.addEventListener('click', function(event) {
    if(curves[selectedCurve].length > 0) {
        curves[selectedCurve].splice(selectedPoint[selectedCurve], 1)
        if(curves[selectedCurve].length === 0) {
            console.log('entrou aqui')
            curves.splice(selectedCurve, 1)
            selectedPoint.splice(selectedCurve, 1)
            if(selectedCurve > 0) {
                selectedCurve--
            }
            if(curves.length === 0) {
                selectedCurve = -1
            }
        }
        reDraw()
    } 
})
editPointButton.addEventListener('click', function(event) {
    canvasState = 2
})
nextPointButton.addEventListener('click', function(event) {
    if(selectedPoint[selectedCurve] < curves[selectedCurve].length - 1) {
        selectedPoint[selectedCurve]++
        reDraw()
    } 
})
previousPointButton.addEventListener('click', function(event) {
    if(selectedPoint[selectedCurve] > 0) {
        selectedPoint[selectedCurve]--
        reDraw()
    } 
})

checkBoxCurves.addEventListener('click', function(event) {
    apparentCurves = !apparentCurves
    reDraw()
})
checkBoxPolygonal.addEventListener('click', function(event) {
    apparentPolygonal = !apparentPolygonal
    reDraw()
})
checkBoxPoints.addEventListener('click', function(event) {
    apparentPoints = !apparentPoints
    reDraw()
})

evaluationsInput.addEventListener('keyup', function(event) {
    const input = event.target.value
    evaluationsNumber = parseInt(input)
    reDraw()
})