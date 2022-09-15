import { useState, useEffect, useRef } from 'react';
import { run } from './SIR'
import { IoMdHelpCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import "./Feature3.scss"

/**
 * Feature 3 of application: Engine for predicting daily cases and daily deaths using the SIRD model
 * 
 * @param {{object[], string}} param0 cases, deaths and vaccination rate data for all countries available from the
 * API and the current colour theme   
 * @returns react component of the feature
 */
export default function Feature3({ data, theme }) {
    const [covidData, setData] = useState()
    const [object, setObject] = useState(null)
    const [helpBoxState, setHelpBoxState] = useState(false)
    const [feature3Theme, setTheme] = useState("Feature3-light")

    const countryRef = useRef()
    const vacRateRef = useRef()
    const dayNumRef = useRef()

    useEffect(() => {
        var obj = data
        if (data !== undefined) {
            var result = Object.keys(obj).map((key) => [key, obj[key]]);
        }
        setData(result)
    }, [data])

    useEffect(() => {
        if (theme === "App-light") {
            setTheme("Feature3-light")
        }
        else {
            setTheme("Feature3-dark")
        }
    }, [theme])

    /**
     * Looks through all data in covid data and retrieves only the population, deaths and cases 
     * data for the specific country
     * 
     * @param {string} country string containing country of the data 
     * @returns array of population, deaths and daily cases data in its 0th ... 2nd index respectively
     */
    function UseData(country) {

        data = []
        for (let i = 0; i < covidData.length; i++) {
            if (covidData[i][1].location === country) {
                data.push(covidData[i][1].population)

                // add deaths to data
                data.push(covidData[i][1].data[covidData[i][1].data.length - 1].total_deaths)

                // add cases to data
                let cases = []
                for (let j = 0; j < (covidData[i][1].data.length); j++) {
                    cases.push(covidData[i][1].data[j].new_cases)
                }
                data.push(cases)
            }
        }
        return data
    }

    /**
     * Performs the calculations for the new cases and deaths for a specified day number for 
     * a given country with given vaccination rate. Uses the SIR model to perform the calculations. 
     * 
     * @param {string} country string of target country 
     * @param {number} vacRate vaccination rate for SIR model 
     * @param {number} day day number for SIR model
     * @returns object with the result newCases and death as keys, both numbers
     */
    function SIRcal(country, vacRate, day) {
        var dataSIR = UseData(country)
        var population = dataSIR[0]
        var deaths = dataSIR[1]
        var cases = dataSIR[2]
        let object = run(cases, population, deaths, vacRate / 100, day)
        return object
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
     * Performs error checks for user input then calls the SIR calculation function and displays the output
     */
    function runEngine() {

        // check if data loaded in yet
        if (covidData === undefined) {
            // data is not yet loaded
            alert("No data yet, please try again shortly")
            return
        }

        let vacRate = vacRateRef.current.value
        let day = dayNumRef.current.value
        let countrySelection = countryRef.current.value

        // Performing error checks for user input
        if (vacRate !== undefined && vacRate !== null && vacRate >= 0 && vacRate <= 100 && vacRate.length !== 0) {
            if (day !== undefined && day !== null && day.length !== 0 && day >= 1) {
                let foundCountry = false
                for (let i = 0; i < covidData.length; i++) {
                    if (covidData[i][1].location === countrySelection) {
                        foundCountry = true
                        break
                    }
                }
                if (!foundCountry) {
                    alert("Your selected country is invalid or empty")
                    return
                }
            }
            else {
                alert("Your input was invalid or empty, please ensure the day number is given as a valid number greater than 1.")
                return
            }
        }
        else {
            alert("Your input was invalid or empty, please ensure the vaccination rate is given as a valid percentage. (eg. input '50' for 50%)")
            return
        }
        let ob = SIRcal(countrySelection, vacRate, day)
        setObject(ob)
    }

    /**
     * Creates the HTML elements for the the cases and death each day
     * 
     * @returns HTML element for the graph
     */
    function ShowGraph() {
        if (object !== null) {
            return <div>
                <h2>New cases each day: {object.newCases}</h2>
                <h2>New death each day: {object.deaths}</h2>
            </div>
        }
        else {
            return null
        }
    }

    /**
     * Creates a react icon component depending on if the help text is currently displayed. If not it is a "?", else it
     * will be a "X"
     * 
     * @returns react icon component for user interaction to open/close help information
     */
    function ShowHelpIcon() {
        if (!helpBoxState) {
            return <IoMdHelpCircleOutline onClick={() => { setHelpBoxState(!helpBoxState) }} className="help-icon-3"></IoMdHelpCircleOutline>
        } else {
            return <IoMdCloseCircleOutline onClick={() => { setHelpBoxState(!helpBoxState) }} className="help-icon-3"></IoMdCloseCircleOutline>
        }
    }

    /**
     * Creates a HTML object for the div which appears when the help button is clicked
     * 
     * @returns HTML object containing the help information
     */
    function ShowHelp() {
        if (helpBoxState) {
            return <div className="help-body-div-3">
                <h3>Help Information</h3>
                <p className="help-body-text-3">
                    The COVID ENGINE uses the SIRD model to estimate the number of cases per day and number of deaths
                    per day in the specified country when its population is at the specified vaccination rate (fully vaccinated)
                    on a specified number of days after the initial outbreak. <br></br>
                    <br></br>
                    <span className="highlight-red">SIRD</span> Model: Stands for:<br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Susceptible:</span> the part of the population that can still be infected <br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Infected:</span> the part of the population that is currently infected <br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Recovered:</span> the part of the population that have recovered after infection <br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Dead:</span> the part of the population who has died <br></br>
                    <br></br>
                    Input Guide: <br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Vaccination Rate:</span> Percentage of fully vaccinated in the whole population <br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Day Number:</span> Number of days from the initial outbreak <br></br>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="highlight-blue">Country Selection:</span> Target country to run estimation for
                </p>
            </div>
        }
        else {
            return null;
        }
    }

    return (
        <div className={feature3Theme}>
            <ShowHelpIcon></ShowHelpIcon>
            <ShowHelp></ShowHelp>

            <h1 className="feature-heading"> Covid Engine</h1>
            <br></br>

            <div id="innerDiv3">
                <div id="innerLabelsDiv3">
                    <label className="input-label-3">Vaccination Rate (%):</label>
                    <br></br>
                    <label className="input-label-3">Day Number:</label>
                    <br></br>
                    <label className="input-label-3">Country Selection:</label>
                </div>
                <div id="innerInputsDiv3">
                    <input ref={vacRateRef} type="number" id="inputVRate" name="inputVRate" className="input-field-3" min="0" max="100"></input>
                    <br></br>
                    <input ref={dayNumRef} type="number" id="inputNo2" name="inputNo2" className="input-field-3" min="1"></input>
                    <br></br>
                    <input ref={countryRef} list="countryList" id="countrySelection" name="countrySelection" className="input-field-3" />
                    <div dangerouslySetInnerHTML={{ __html: htmlCountryList() }} />
                </div>

                <div id="buttonDiv3">
                    <button className="submit-button" onClick={runEngine}>Submit and Run</button>
                </div>
            </div>

            <ShowGraph></ShowGraph>

        </div>
    )
}
