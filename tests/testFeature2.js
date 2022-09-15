// Tests for feature 2 go here
let covidData = [
    [
        'AFG',
        {
            population: 12323,
            location: "Angola",
            continent: "Africa",
            data: [
                {
                    date: "2021-09-01",
                    new_cases: 3,
                    new_deaths: 2,
                    new_vaccinations: 5

                },
                {
                    date: "2021-09-02",
                    new_cases: 5,
                    new_deaths: 2,
                    new_vaccinations: 6

                },
                {
                    date: "2021-09-03",
                    new_cases: 2,
                    new_deaths: 7,
                    new_vaccinations: 1

                },
                {
                    date: "2021-09-04",
                    new_cases: 6,
                    new_deaths: 2,
                    new_vaccinations: 7

                },
                {
                    date: "2021-09-05",
                    new_cases: 7,
                    new_deaths: 1,
                    new_vaccinations: 2

                },
                {
                    date: "2021-09-06",
                    new_cases: 7,
                    new_deaths: 4,
                    new_vaccinations: 6

                },
                {
                    date: "2021-09-07",
                    new_cases: 2,
                    new_deaths: 7,
                    new_vaccinations: 1

                },
                {
                    date: "2021-09-08",
                    new_cases: 8,
                    new_deaths: 2,
                    new_vaccinations: 5

                },
                {
                    date: "2021-09-09",
                    new_cases: 2,
                    new_deaths: 5,
                    new_vaccinations: 3

                },
                {
                    date: "2021-09-10",
                    new_cases: 7,
                    new_deaths: 4,
                    new_vaccinations: 2

                },
                {
                    date: "2021-09-11",
                    new_cases: 7,
                    new_deaths: 2,
                    new_vaccinations: 54

                }
            ]
        }
    ],
    [
        'AUS',
        {
            population: 12456,
            location: "Australia",
            continent: "Oceania",
            data: [
                {
                    date: "2021-09-01",
                    new_cases: 6,
                    new_deaths: 2,
                    new_vaccinations: 5

                },
                {
                    date: "2021-09-02",
                    new_cases: 1,
                    new_deaths: 2,
                    new_vaccinations: 7

                },
                {
                    date: "2021-09-03",
                    new_cases: 5,
                    new_deaths: 2,
                    new_vaccinations: 7

                },
                {
                    date: "2021-09-04",
                    new_cases: 2,
                    new_deaths: 5,
                    new_vaccinations: 6

                },
                {
                    date: "2021-09-05",
                    new_cases: 1,
                    new_deaths: 7,
                    new_vaccinations: 4

                },
                {
                    date: "2021-09-06",
                    new_cases: 7,
                    new_deaths: 4,
                    new_vaccinations: 26

                },
                {
                    date: "2021-09-07",
                    new_cases: 21,
                    new_deaths: 27,
                    new_vaccinations: 51

                },
                {
                    date: "2021-09-08",
                    new_cases: 68,
                    new_deaths: 12,
                    new_vaccinations: 45

                },
                {
                    date: "2021-09-09",
                    new_cases: 22,
                    new_deaths: 55,
                    new_vaccinations: 13

                },
                {
                    date: "2021-09-10",
                    new_cases: 72,
                    new_deaths: 54,
                    new_vaccinations: 12

                },
                {
                    date: "2021-09-11",
                    new_cases: 27,
                    new_deaths: 52,
                    new_vaccinations: 54

                }
            ]
        }
    ]
]


// tests for UseData
/**
 * Looks through all data in covid data and retrieves only the case, death and vaccination of the 
 * specific country during the specified period of time.
 * 
 * @param {string} country string containing country of the data 
 * @param {string} startDate string representing the starting date of the data, in the format (yyyy-mm-dd)
 * @param {string} endDate string representing the end date of the data, in the format (yyyy-mm-dd)
 * @returns an array of 3 arrays of objects. First array contains array of vaccination data, second contains deaths
 * data and thrid contains daily cases data. 
 */
function UseData(country, startDate, endDate) {
    let data = []
    for (let i = 0; i < covidData.length; i++) {
        if (covidData[i][1].location === country) {
            // add vaccination to data
            let vaccination = []
            let vacTotal = null
            let death = []
            let cases = []
            let dateRange = false
            if (startDate === "" || Date.parse(startDate) < Date.parse(covidData[i][1].data[0].date)) {
                dateRange = true
            }
            for (let j = 0; j < (covidData[i][1].data.length); j++) {

                if (covidData[i][1].data[j].date === startDate) {
                    dateRange = true
                }
                if (covidData[i][1].data[j].date === endDate) {
                    dateRange = false
                }
                if (dateRange) {
                    if (covidData[i][1].data[j].hasOwnProperty("new_vaccinations")) {
                        vacTotal += covidData[i][1].data[j].new_vaccinations
                        vaccination.push({ rate: (vacTotal * 100 / covidData[i][1].population) / 2, date: covidData[i][1].data[j].date })
                    }
                    if (covidData[i][1].data[j].hasOwnProperty("new_deaths")) {
                        death.push({ rate: covidData[i][1].data[j].new_deaths, date: covidData[i][1].data[j].date })
                    }
                    cases.push({ rate: covidData[i][1].data[j].new_cases, date: covidData[i][1].data[j].date })
                }
            }
            data.push(vaccination)
            data.push(death)
            data.push(cases)
            break
        }
    }
    return data
}

function testUseData1() {
    let data = UseData("Australia", "2021-09-01", "2021-09-11")
    console.assert(data !== undefined, "Data is empty")
    console.assert(data.length === 3, "Data is insufficient")
    console.assert(data[2][0].date === "2021-09-01", "First date of data is wrong")
}

function testUseData2() {
    let data = UseData("Australia", "2021-09-05", "2021-07-11")
    console.assert(data !== undefined, "Data is empty")
    console.assert(data.length === 3, "Data is insufficient")
    console.assert(data[2][0].date === "2021-09-05", "First date of data is wrong")
}
testUseData1()
testUseData2()


// test validation
/**
 * Checks the validity of the data and if it's not valid, returns a different integer depending
 * on the reason for the invaliidity, e.g. 2 for invalid date inputs, 0 for data not ready, 1 
 * for country not found, etc.
 * 
 * @param {string} country string containing country of the data 
 * @param {string} startDate string representing the starting date of the data, in the format (yyyy-mm-dd)
 * @param {string} endDate string representing the end date of the data, in the format (yyyy-mm-dd)
 * @returns an integer if the data is invalid and returns the array of data if it is valid
 */
function validation(country, startDate, endDate) {
    // check if data loaded in yet
    if (covidData === undefined) {
        // data not ready yet!
        return 0
    }

    // country validation
    let countryFound = false

    for (let i = 0; i < covidData.length; i++) {
        if (covidData[i][1].location === country) {
            countryFound = true
        }
    }
    if (countryFound === false) {
        return 1
    }

    // date validation
    let startDateObject = new Date(startDate);
    let endDateObject = new Date(endDate);
    let today = new Date();

    if (startDateObject > today || endDateObject > today || startDateObject > endDateObject) {
        // if start date or end date is in the future, or if start date is later than end date
        return 2;
    }

    let data = {
        country: country,
        startDate: startDate,
        endDate: endDate
    }
    return data
}

function testValidation() {
    // australia is in the data base, should be returned
    let data = validation("Australia", "20-04-2020", "27-04-2020")
    console.assert(data !== undefined, "Data is empty")
    console.assert(data.country === "Australia", "Country incorrect")
    console.assert(data.startDate === "20-04-2020", "start date incorrect")
    console.assert(data.endDate === "27-04-2020", "end date incorrect")
}

function testValidation1() {
    // country cannot be found, should return a 1
    let data = validation("Non existent country", "20-04-2020", "27-04-2020")
    console.assert(data === 1, "Validation didn't return correct code for unfound country")

    data = validation("North America", "20-04-2020", "27-04-2020")
    console.assert(data === 1, "Validation didn't return correct code for unfound country")

    data = validation("Japan", "20-04-2020", "27-04-2020")
    console.assert(data === 1, "Validation didn't return correct code for unfound country")
}
testValidation()
testValidation1()


// test padArrayWithDates
/**
 * Prepares the data so that for dates where the data is not recoreded, it will pad it with a null 
 * so that the data it can still be graphed for every date in the dates array. 
 * 
 * @param {string[]} dates array of all dates that needs to be graphed
 * @param {Object[]} dataArr array with data to be padded
 * @returns new array of data that has the same length as the dates array
 */
function padArrayWithDates(dates, dataArr) {
    let paddedData = []
    let dataObject = {}
    dataArr.forEach(death => {
        dataObject[death.date] = death.rate
    })
    dates.forEach(date => {
        if (dataObject[date] === undefined) {
            paddedData.push(null)
        } else {
            paddedData.push(dataObject[date])
        }
    })
    return paddedData
}

function testPadArrayWithDatesOneDateOfDataMissing() {
    let dates = ["2021-09-01", "2021-09-02", "2021-09-03", "2021-09-04", "2021-09-05"]
    let cases_dates = [
        {
            rate: 2,
            date: "2021-09-01"
        },
        {
            rate: 4,
            date: "2021-09-02"
        },
        {
            rate: 1,
            date: "2021-09-04"
        },
        {
            rate: 4,
            date: "2021-09-05"
        },
    ]
    let new_case_array = padArrayWithDates(dates, cases_dates)
    console.assert(new_case_array.length = dates.length)
    console.assert(new_case_array[2] === null)
}

function testPadArrayWithDatesDataAtBeginningMissing() {
    let dates = ["2021-09-01", "2021-09-02", "2021-09-03", "2021-09-04", "2021-09-05"]
    let cases_dates = [
        {
            rate: 2,
            date: "2021-09-02"
        },
        {
            rate: 4,
            date: "2021-09-03"
        },
        {
            rate: 1,
            date: "2021-09-04"
        },
        {
            rate: 4,
            date: "2021-09-05"
        },
    ]
    let new_case_array = padArrayWithDates(dates, cases_dates)
    console.assert(new_case_array.length = dates.length)
    console.assert(new_case_array[0] === null)
}

testPadArrayWithDatesOneDateOfDataMissing()
testPadArrayWithDatesDataAtBeginningMissing()