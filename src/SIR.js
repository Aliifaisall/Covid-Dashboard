// For more detailed explanation of this function, refer to the SIR model document
const k = 15;        // average duration of a COVID case
const a = 1/k;       // rates at which people either recover or die from COVID each date
const b = 1;         // number of contacts each infected individual makes per day
const delta = 0.01;  // COVID's death rates
const x = 0.98;       // percentage reduction of susceptibility to COVID for vaccinated individual
const y = 0.98;       // percentage reduction of death from COVID for vaccinated individual
const N = 100000     // population size. Write code to retrieve it here

/**
 * Calculates the number of active infections in vaccinated and unvaccinated. This is the sum all 
 * new cases in the last 15 days. If the input list's length is shorter than 15, this is just the 
 * sum of the whole list. 
 * 
 * @param {number[]} dailyCaseNumbers array containing of new case numbers for each day
 * @returns the number of total active infections  
 */
function findI0(dailyCaseNumbers) {
    let i0 = 0;
    if (dailyCaseNumbers.length > k) {
        for (let i = dailyCaseNumbers.length-1; i > dailyCaseNumbers.length-1-k; i--) {
            i0 += dailyCaseNumbers[i];
        }
    } else {
        i0 = dailyCaseNumbers.reduce((sum, currentNum) => sum + currentNum);
    }
    return i0;
}

/**
 * Calculates the value of the susceptible group, which includes both vaccinated susceptibles 
 * and unvaccinated susceptibles. This is the current population size - number of current infections
 * 
 * @param {number} populationSize size of total population
 * @param {number} i0 infected population
 * @returns the current size of the susceptible group
 */
function findS0(populationSize, i0) {
    return populationSize - i0;
}

/**
 * Calculates the total number of recoveries since the beginning of the outbreak. The function does this 
 * by adding all the case number from the beginning of the outbreak to 15 days before today, then minus 
 * number of deaths so far
 * 
 * @param {number[]} dailyCaseNumbers array containing of new case numbers for each day
 * @param {number} deaths number of people who has died 
 * @returns total number of recoveries
 */
function findR0(dailyCaseNumbers, deaths) {
    let r0 = 0;
    if (dailyCaseNumbers.length > k) {
        for (let i = 0; i < dailyCaseNumbers.length-k; i++) {
            r0 += dailyCaseNumbers[i];
        }
        r0 -= deaths;
    } else {
        r0 = 0;
    }
    return r0;
}

/**
 * Calculates the total deaths from the beginning of the outbreak
 * 
 * @param {number[]} deathNumbers array containing deaths for each day
 * @returns total the number of deaths
 */
function findD0(deathNumbers) {
    let d0 = deathNumbers.reduce((sum, currentNum) => sum + currentNum);
    return d0;
}

/**
 * Calculates the predicted number of cases and deaths on that day in the future
 * 
 * @param {number} s0 the current size of the susceptible group
 * @param {number} i0 the number of total active infections
 * @param {number} r0 total number of recoveries
 * @param {number} d0 total number of deaths
 * @param {number} day number of days into the future to predict
 * @param {number} v vaccination rate of the population 
 * @param {number} N country's population size
 * @returns predicted number of cases and deaths on that day in the future
 */
function covidSir(s0, i0, r0, d0, day, v, N) {
    let returnObject = {}

    // Declare and nitialise the arrays with their day 0 numbers
    let Suv = [s0*(1-v)]
    let Sv = [s0*v]
    let Iuv = [i0]
    let Iv = [0]
    let D = [d0]
    let R = [r0]

    for (let t = 0; t < day; t++) {
        // Number of new cases
        let newCasesUnvaccinated =  b*(Iuv[t]+Iv[t])*Suv[t]/N;
        newCasesUnvaccinated = newCasesUnvaccinated > Suv[t] ? 0 : newCasesUnvaccinated;
        let newCasesVaccinated =  b*(Iuv[t]+Iv[t])*Sv[t]/N*(1-x);
        newCasesVaccinated = newCasesVaccinated > Sv[t] ? 0 : newCasesVaccinated;

        // Updating susceptible numbers:
        Suv[t+1] = Suv[t] - newCasesUnvaccinated;
        Sv[t+1] = Sv[t] - newCasesVaccinated;

        // Updating infection numbers: 
        Iuv[t+1] = (Iuv[t] + newCasesUnvaccinated - a*Iuv[t]);
        Iv[t+1] = (Iv[t] + newCasesVaccinated - a*Iv[t]);

        // Updating recovery number: 
        R[t+1] = R[t] + a*Iuv[t]*(1-delta) + a*Iv[t]*(1-delta+delta*y);

        // Updating death numbers
        D[t+1] = D[t] + a*Iuv[t]*delta+ a*Iv[t]*delta*(1-y);

        // Update return object on the last day
        if (t === day-1) {
            returnObject["newCases"] = Math.round(newCasesUnvaccinated + newCasesVaccinated);
            returnObject["deaths"] = Math.round(D[t+1] - D[t]);
        }
    }
    return returnObject
}

/**
 * Runs the SIRD model to compute the prediction for a specified day in the future for the 
 * case number and death number of that day.
 * 
 * @param {number[]} cases array containing of new case numbers for each day
 * @param {number} populationSize size of total population
 * @param {number} deaths number of people who has died 
 * @param {*} vacRate vaccination rate of the population
 * @param {number} day number of days into the future to predict

 * @returns predicted case number and death number on the day
 */
export function run(cases,populationSize,deaths,vacRate,day){
    let i0 = findI0(cases);
    let s0 = findS0(populationSize, i0);
    let r0 = findR0(cases, deaths);
    let object = covidSir(s0, i0, r0, deaths, day, vacRate, populationSize)

    return object
}
