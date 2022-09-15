import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2'
import { IoMdInformationCircleOutline } from "react-icons/io";
import Loader from "react-loader-spinner";
import "./Feature2.scss"

/**
 * Feature 2 of application: graph of daily cases, deaths and vaccination rates for different countries
 * and the options for the adjusting the graph
 * 
 * @param {{object[], string}} param0 cases, deaths and vaccination rate data for all countries available from the
 * API and the current colour theme  
 * @returns react component of feature 2
 */
export default function Feature2({ data, theme }) {
    const [covidData, setData] = useState()
    const [graphData, setGraphData] = useState()
    const [feature2Theme, setTheme] = useState("Feature2-light")

    const [popupShow, setPopupShow] = useState(false)
    const countryRef = useRef()
    const startDateRef = useRef()
    const endDateRef = useRef()

    const defaultCountry = "Australia"

    useEffect(() => {
        var obj = data
        if (data !== undefined) {
            var result = Object.keys(obj).map((key) => [key, obj[key]]);
        }
        setData(result)
    }, [data])

    useEffect(() => {
        if (theme === "App-light") {
            setTheme("Feature2-light")
        }
        else {
            setTheme("Feature2-dark")
        }
    }, [theme])

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
        data = []
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

    /**
     * Generates html string for dropdown box options of countries from available data
     * 
     * @returns string containing the HTML element for the drop box of countries
     */
    function htmlCountryList() {
        if (typeof covidData !== "undefined") {
            let htmlCountryString = `<datalist id="countryList">`
            for (let i = 0; i < covidData.length; i++) {
                htmlCountryString += `<option value="${covidData[i][1].location}"></option>`
            }
            htmlCountryString += `</datalist>`
            return htmlCountryString
        }
    }

    /**
     * Runs when users click the [Submit] button. It retrieves inputs that the user has inputted
     * in the input fields and checks that it is valid. If it is, it call createGraphData to create a 
     * data object for the new graph and updates this to the global variable graphData 
     */
    function submit() {
        // either contain the actual data or an error value
        let userSelectedData = validation(countryRef.current.value, startDateRef.current.value, endDateRef.current.value)

        if (userSelectedData === 0) {
            alert("Data not ready, please wait a moment...")

        } else if (userSelectedData === 1) {
            alert("Please select country from the drop down menu")

        } else if (userSelectedData === 2) {
            alert("Please ensure start date and end date inputs are valid")

        } else {
            setGraphData(createGraphData(userSelectedData))
        }
    }

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

        data = {
            country: country,
            startDate: startDate,
            endDate: endDate
        }
        return data
    }

    /**
     * Creates and return an object that has the formatted date labels, cases data array, deaths data 
     * array and vaccination rate data array ready to be graphed. It checks through the numbers and ensure 
     * the negative values are dealt with. If the argument dataObject is null, it will use the default 
     * country (Australia) as its location, else it'll use the specified country.
     * 
     * @param {Object} dataObject 
     * @returns Object containing data in the format ready to be graphed using chartjs
     */
    function createGraphData(dataObject) {

        let countryChosen = "";
        let startDay = "";
        let endDay = ""

        if (dataObject === null) {
            countryChosen = defaultCountry

        } else {
            countryChosen = dataObject.country  // Extract country name from dataObject here
            startDay = dataObject.startDate
            endDay = dataObject.endDate
        }

        let countryData = UseData(countryChosen, startDay, endDay)

        if (countryData === []) {
            alert("No data yet, please try again shortly")
            return
        }

        // get date labels from cases data 
        let dateLabelsUnformatted = countryData[2].map(element => element.date)

        // Format date labels to dd/mm/yyyy 
        let dateLabels = dateLabelsUnformatted.map(element => {
            let date = new Date(element)
            return date.toLocaleDateString()
        })

        // for loop iterating through and inverting signs of erroneous negative case entries
        let casesArray = countryData[2].map(element => element.rate)
        for (let i = 0; i < casesArray.length; i++) {
            if (casesArray[i] < 0) {
                casesArray[i] = -casesArray[i]
            }
        }
        let deathsArray = padArrayWithDates(dateLabelsUnformatted, countryData[1])
        let vaccArray = padArrayWithDates(dateLabelsUnformatted, countryData[0])

        let dataForGraph = {
            labels: dateLabels,
            datasets: [{
                label: 'New cases',
                data: casesArray,
                borderWidth: 1,
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                tension: 1,
                yAxisID: 'case_death',
                xAxisID: 'date_period'
            }, {
                label: 'Deaths',
                data: deathsArray,
                borderWidth: 1,
                fill: false,
                borderColor: 'rgb(0, 0, 255)',
                tension: 0.1,
                yAxisID: 'case_death',
            }, {
                label: 'Vaccination rate',
                data: vaccArray,
                borderWidth: 1,
                fill: false,
                borderColor: 'rgb(0, 255, 0)',
                tension: 0.1,
                yAxisID: 'vaccinate',
            }
            ]
        }
        return dataForGraph
    }

    /**
     * Prepares the data so that for dates where the data is not recoreded, it will pad it with a null 
     * so that the data it can still be graphed for every date in the dates array. 
     * 
     * @param {string[]} dates array of all dates that needs to be graphed
     * @param {object[]} dataArr array with data to be padded
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

    /**
     * Creates the HTML elements for the graph and shows it on the page
     * 
     * @returns HTML element for the graph
     */
    function showGraph() {

        if (covidData !== undefined) {
            let dataToDisplay = {}
            if (graphData === undefined) {
                dataToDisplay = createGraphData(null)
            } else {
                dataToDisplay = graphData
            }

            let country = countryRef.current.value

            if (country === "") {
                country = defaultCountry
            }

            return <Line
                data={dataToDisplay}
                options={{
                    plugins: {
                        title: {
                            display: true,
                            text: `Cases, Deaths, Vaccination Rate for ${country} against time`,
                            fontSize: 20
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    elements: {
                        point: {
                            radius: 0.1
                        }
                    },
                    scales: {
                        case_death: {
                            display: true,
                            position: 'left',
                            type: 'linear',
                            min: 0,
                            title: {
                                display: true,
                                text: 'New Cases/Deaths (per day)'
                            }
                        },
                        vaccinate: {
                            display: true,
                            position: 'right',
                            type: 'linear',
                            min: 0,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Vaccination Rate (%)'
                            }
                        },
                        date_period: {
                            display: true,
                            position: 'bottom',
                            title: {
                                display: true,
                                text: 'Date (dd/mm/yyyy)'
                            }
                        }
                    }
                }}

                // radio of height and width
                height={11}
                width={10}
            ></Line>
        } else {
            return <div className="loading-div">
                <Loader
                    type="Oval"
                    color="#a6a6a6">
                </Loader>
            </div>
        }
    }

    /**
     * Changes the inputs to the dates fields depending on the button pressed and the colours of the buttons. 
     * 
     * E.g. pressing the [Last Week] button will set the start date to 7 days ago and the end date to today. 
     * It enables the date input fields if [Other] is chosen. It also changes colour of the pressed button 
     * and the other non-chosen buttons back to the usual colour to indiate which has been pressed.
     * 
     * @param {string} id id of the time button pressed
     */
    function timeButtonClick(id) {

        const today = new Date();
        const todayString = today.toISOString().split("T")[0]; // format of yyyy-mm-dd

        // set all button colours to normal
        Array.prototype.forEach.call(document.getElementsByClassName("time-sel-button-2"), (button) => {

            button.setAttribute("style", "background-color:rgb(95, 109, 236)")
        })
        // set colour of pressed button to different
        document.getElementById(id).setAttribute("style", "background-color:#5ad3af9a")

        // if other is pressed, enable date input, else disable
        if (id === "otherButton") {

            startDateRef.current.disabled = false;
            startDateRef.current.max = todayString;
            endDateRef.current.disabled = false;
            endDateRef.current.max = todayString;

        } else {
            startDateRef.current.disabled = true;
            endDateRef.current.disabled = true;
        }

        // depending on which button pressed, prefills/displays different dates
        switch (id) {
            case "weekButton":
                let weekBefore = new Date()
                weekBefore.setDate(today.getDate() - 7);

                startDateRef.current.value = weekBefore.toISOString().split("T")[0];
                endDateRef.current.value = todayString;

                break;
            case "monthButton":
                let monthBefore = new Date();
                monthBefore.setMonth(today.getMonth() - 1);

                startDateRef.current.value = monthBefore.toISOString().split("T")[0];
                endDateRef.current.value = todayString;

                break;
            case "yearButton":
                let yearBefore = new Date();
                yearBefore.setFullYear(today.getFullYear() - 1);

                startDateRef.current.value = yearBefore.toISOString().split("T")[0];
                endDateRef.current.value = todayString;
                break;
            default:
                break;
        }
    }

    return (
        <div className={feature2Theme}>
            <h1 className="feature-heading">Graphs by Country</h1>

            <br></br>
            <div id="leftGraph2">
                {showGraph()}
            </div>

            <div id="rightOptions2">

                <div>
                    <IoMdInformationCircleOutline className="info-icon" onClick={() => { setPopupShow(!popupShow) }}></IoMdInformationCircleOutline>

                    {popupShow && <div className="popup-div">
                        <div className="popup-overlay" onClick={() => { setPopupShow(!popupShow) }}>
                            <div className="popup-content">
                                Use the options below to change the country and date range the graph on the left is showing.
                                <br></br>
                                <br></br>
                                This data was sourced from:
                                <br></br>
                                <a href="https://covid.ourworldindata.org/">Our World In Data COVID-19 Data</a>
                            </div>
                        </div>
                    </div>}
                </div>

                <h3>Options</h3>
                <label className="input-label-2">Country Selection: </label>
                <input ref={countryRef} list="countryList" id="countrySelection" name="countrySelection" className="input-field-2" defaultValue={defaultCountry} />
                <div dangerouslySetInnerHTML={{ __html: htmlCountryList() }} />

                <label className="input-label-2">Time Period: </label>
                <br></br>
                <button className="time-sel-button-2" id="weekButton" onClick={() => { timeButtonClick("weekButton"); }}>Past Week</button>
                <button className="time-sel-button-2" id="monthButton" onClick={() => { timeButtonClick("monthButton"); }}>Past Month</button>
                <button className="time-sel-button-2" id="yearButton" onClick={() => { timeButtonClick("yearButton"); }}>Past Year</button>
                <button className="time-sel-button-2" id="otherButton" onClick={() => { timeButtonClick("otherButton"); }}>Other</button>
                <br></br>
                <br></br>

                <label className="small-label-2">From: </label>
                <input ref={startDateRef} disabled className="date-field-2" id="fromDate" type="date" />

                <label className="small-label-2">Until: </label>
                <input ref={endDateRef} disabled className="date-field-2" id="toDate" type="date" />

                <div id="graphOptions2">
                    <p>
                        Click on the <span className="highlight-red">legend</span> above the graph to show/hide graphs.
                        If any of <span className="highlight-blue">cases</span>, <span className="highlight-blue">deaths </span>
                        or <span className="highlight-blue">vaccination rate </span> lines do not show up,
                        it means there is no data available.
                    </p>
                </div>

                <button className="submit-button" onClick={() => {
                    submit()
                }}> Submit</button>
            </div>
        </div>
    )
}
