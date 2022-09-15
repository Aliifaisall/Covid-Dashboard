import {run} from '../src/SIR.js'
function test_day_1(){
    var caseArray = [2, 1, 2, 4, 3, 6, 10, 12, 9, 6, 8, 3, 2, 2, 4, 5, 3, 2, 10, 5, 7, 6, 3];
    var deaths = 5;
    var populationSize = 100000;
    var vaccinationRate = 0.85;
    var days = 1;
    let object = run(caseArray, populationSize, deaths, vaccinationRate, days);
    console.assert(object.deaths === 0, "Wrong number of deaths")
    console.assert(object.newCases === 53, "Wrong number of new cases")
}

function test_day_2(){
    var caseArray = [2, 1, 2, 4, 3, 6, 10, 12, 9, 6, 8, 3, 2, 2, 4, 5, 3, 2, 10, 5, 7, 6, 3];
    var deaths = 5;
    var populationSize = 100000;
    var vaccinationRate = 0.85;
    var days = 2;
    let object = run(caseArray, populationSize, deaths, vaccinationRate, days);
    console.assert(object.deaths === 0, "Wrong number of deaths")
    console.assert(object.newCases === 86, "Wrong number of new cases")
}

function test_vax_rate_0(){
    var caseArray = [2, 1, 2, 4, 3, 6, 10, 12, 9, 6, 8, 3, 2, 2, 4, 5, 3, 2, 10, 5, 7, 6, 3];
    var deaths = 5;
    var populationSize = 100000;
    var vaccinationRate = 0;
    var days = 1;
    let object = run(caseArray, populationSize, deaths, vaccinationRate, days);
    console.assert(object.deaths === 0, "Wrong number of deaths")
    console.assert(object.newCases === 225, "Wrong number of new cases")
}

function test_vax_rate_1(){
    var caseArray = [2, 1, 2, 4, 3, 6, 10, 12, 9, 6, 8, 3, 2, 2, 4, 5, 3, 2, 10, 5, 7, 6, 3];
    var deaths = 5;
    var populationSize = 100000;
    var vaccinationRate = 1;
    var days = 1;
    let object = run(caseArray, populationSize, deaths, vaccinationRate, days);
    console.assert(object.deaths === 0, "Wrong number of deaths")
    console.assert(object.newCases === 22, "Wrong number of new cases")
}

test_day_1()
test_day_2()
test_vax_rate_0()
test_vax_rate_1()