import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2'
import { IoIosArrowRoundBack, IoIosArrowRoundForward, IoMdInformationCircleOutline } from "react-icons/io";
import { Slider } from '@material-ui/core'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Loader from "react-loader-spinner";
import 'react-tabs/style/react-tabs.css';
import './Feature1.scss'

/**
 * Feature 1 of application: daily cases and graph for victorian cases
 * 
 * @param {{object[], string}} param0 victorian cases data and current colour theme  
 * @returns react component of feature 1
 */
export default function Feature1({ data, theme }) {
    const [vicData, setVicData] = useState()
    const [feature1Theme, setTheme] = useState("Feature2-light")

    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [smoothingValue, setSmoothingValue] = useState(1)
    const [popupShow, setPopupShow] = useState(false)
    const updateRange = (e, data) => { setSmoothingValue(data) }

    useEffect(() => {
        if (theme === "App-light") {
            setTheme("Feature1-light")
        }
        else {
            setTheme("Feature1-dark")
        }
    }, [theme])

    useEffect(() => {
        setVicData(data)
    }, [data])
    useEffect(() => {
        let today = new Date()
        let startDay = new Date()

        if (today.getMonth() < 6) {
            startDay.setMonth(startDay.getMonth() - 6)
            startDay.setYear(startDay.getYear() - 1)
        }
        else {
            startDay.setMonth(startDay.getMonth() - 6)
        }
        setStartDate(startDay)
        setEndDate(today)

    }, [])

    /**
     * Receives a startDay, endDay input strings and smoothness value then extracts the specified data from vicData
     * 
     * @param {Date} startDate Date object of the start date of the data to be taken
     * @param {Date} endDate Date object of the last date of the data to be taken
     * @param {number} smoothness a smoothness level between 1 (not smoothed) to 7 (smoothed by 7 days)
     * @returns array of cases per day for victoria already smoothed
     */
    function UseData(startDate, endDate, smoothness) {
        data = []

        let startDateStrArr = new Date(startDate).toDateString().split(" ");
        let startDateStr = startDateStrArr[2] + " " + startDateStrArr[1] + " " + startDateStrArr[3].substr(2, 2);
        let endDateStrArr = new Date(endDate).toDateString().split(" ");
        let endDateStr = endDateStrArr[2] + " " + endDateStrArr[1] + " " + endDateStrArr[3].substr(2, 2);

        let inDateRange = false;
        let lastDate = false;

        for (let i = 0; i < vicData.length; i++) {

            if (vicData[i].date === startDateStr) {
                inDateRange = true
            } else if (vicData[i].date === endDateStr) {
                lastDate = true;
            }

            if (inDateRange && vicData[i].cases !== null) {
                data.push(vicData[i])

                if (lastDate) {
                    // this is the last date required, break loop
                    break;
                }
            }
        }
        return smoothData(data, smoothness)
    }

    /**
     * Smooths out the data at each date by averaging it with the data before and after the date
     * the range of this is specified by the smoothness.
     * 
     * @param {object[]} data array of data, each element is an object
     * @param {number} smoothness a smoothness level between 1 (not smoothed) to 7 (smoothed by 7 days)
     * @return the data that has been smoothed
     */
    function smoothData(data, smoothness) {

        const average = (fromIndex, toIndex) => {
            let sum = 0;
            for (let i = fromIndex; i < toIndex; i++) {
                sum += data[i].cases
            }
            return sum / (toIndex - fromIndex)
        }

        let smoothedData = []

        let lowerRange = Math.floor(smoothness / 2);
        let upperRange = Math.ceil(smoothness / 2);
        for (let i = lowerRange; i <= data.length - upperRange; i++) {
            smoothedData.push({ ...data[i], cases: average(i - lowerRange, i + upperRange) })
        }

        return smoothedData
    }

    /**
     * Creates the HTML elements for the daily case number for victoria tab
     * 
     * @returns HTML element for the daily case number tab
     */
    function displayTodayInfo() {

        if (vicData !== undefined) {

            let todayVicIndex = vicData.length - 1
            let todayCaseVal = vicData[todayVicIndex].cases

            if (todayCaseVal == null) {
                todayVicIndex = todayVicIndex - 1
                todayCaseVal = vicData[todayVicIndex].cases
            }

            let todayCaseDate = vicData[todayVicIndex].date

            return <div>
                <IoMdInformationCircleOutline className="info-icon" onClick={() => { setPopupShow(!popupShow) }}></IoMdInformationCircleOutline>

                <div id="caseNumberDiv1">{todayCaseVal}</div>
                <p className="small-label-1">[As recorded on: <i>{todayCaseDate}</i>]</p>

                {popupShow && <div className="popup-div">
                    <div className="popup-overlay" onClick={() => { setPopupShow(!popupShow) }}>
                        <div className="popup-content">
                            This data was sourced from:
                            <br></br>
                            <a href="https://covidlive.com.au/report/daily-cases/vic">Covid Live Victoria Data</a>
                        </div>
                    </div>
                </div>}
            </div>
        }
        else {
            return <div className="loading-div">
                <Loader
                    type="Oval"
                    color="#a6a6a6">
                </Loader>
            </div>
        }
    }

    /**
     * Creates the HTML elements for the graph and shows it on the tab for the gram
     * 
     * @returns HTML element for the graph tab
     */
    function showGraph() {

        if (vicData !== undefined) {
            let dataToDisplay = createGraphData()

            return <div id="graphTab1">

                <Line
                    data={dataToDisplay}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: ``,
                                fontSize: 20
                            },
                            legend: {
                                display: false,
                            }
                        },
                        elements: {
                            point: {
                                radius: 2
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
                                    text: 'New Cases/Day'
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
                    height={36}
                    width={50}
                ></Line>

                <div id="graphControls">

                    <div>
                        <IoIosArrowRoundBack onClick={dataBack} className="arrow-icon-1"></IoIosArrowRoundBack>
                        <IoIosArrowRoundForward onClick={dataForward} className="arrow-icon-1"></IoIosArrowRoundForward>
                    </div>

                    <div id="sliderDiv1">
                        <Slider
                            color="secondary"
                            aria-label="smoothing"
                            defaultValue={1}
                            getAriaValueText={(value) => `${value}`}
                            valueLabelDisplay="auto"
                            value={smoothingValue}
                            onChange={updateRange}
                            marks
                            step={1}
                            min={1}
                            max={7}
                        />
                    </div>

                    <div>
                        <IoMdInformationCircleOutline onClick={() => { setPopupShow(!popupShow) }} className="info-icon" style={{ marginTop: "3vh" }}></IoMdInformationCircleOutline>

                        {popupShow && <div className="popup-div">

                            <div className="popup-overlay" onClick={() => { setPopupShow(!popupShow) }}>
                                <div className="popup-content">
                                    This is a graph of the daily COVID cases in Victoria, since April 9th 2020. Our graph displays
                                    the data over a range of 6 months, for smaller day-to-day fluctuations to be more visible to the user.
                                    <br></br>
                                    <br></br>
                                    The pink sliding scale is available to smooth the data using moving averages (of our own calculations),
                                    ranging from 1 - 7.
                                    <br></br>
                                    <br></br>
                                    This data was sourced from:
                                    <br></br>
                                    <a href="https://covidlive.com.au/report/daily-cases/vic">Covid Live Victoria Data</a>
                                </div>
                            </div>
                        </div>}

                    </div>
                </div>

            </div>
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
     * Creates and return an object that has the formatted date labels, and cases data array ready to be 
     * 
     * @param {Object} dataObject 
     * @returns Object containing data in the format ready to be graphed using chartjs
     */
    function createGraphData() {

        let processedData = UseData(startDate, endDate, smoothingValue)

        // get date labels and number of cases from
        let dateLabels = []
        let casesArray = []

        processedData.forEach(element => {
            let dateString = element.date
            dateLabels.push(new Date(dateString).toLocaleDateString())
            casesArray.push(element.cases)
        })

        let dataForGraph = {
            labels: dateLabels,
            datasets: [{
                label: 'New cases',
                data: casesArray,
                borderWidth: 1,
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                pointBackgroundColor: 'rgb(0, 0, 0)',
                tension: 1,
                yAxisID: 'case_death',
                xAxisID: 'date_period'
            }]
        }
        return dataForGraph
    }

    /**
     * Moves the date range of the graph backwards 6 months (into the past)
     */
    function dataBack() {

        if (startDate.getYear() >= 120) {

            let startDay = startDate
            startDay.setMonth(startDay.getMonth() - 6)

            let endDay = endDate
            endDay.setMonth(endDay.getMonth() - 6)

            setEndDate(new Date(endDay))
            setStartDate(new Date(startDay))
        }
    }

    /**
     * Moves the date range of the graph forwards 6 months (towards the future/current day)
     */
    function dataForward() {

        let today = new Date()
        let end = new Date(endDate)

        end.setMonth(end.getMonth() + 4)

        if (end <= today) {

            let startDay = startDate
            startDay.setMonth(startDay.getMonth() + 6)

            let endDay = endDate
            endDay.setMonth(endDay.getMonth() + 6)

            setEndDate(new Date(endDay))
            setStartDate(new Date(startDay))
        }
    }

    return (
        <div className={feature1Theme}>

            <h1 className="feature-heading">COVID-19 in Victoria</h1>
            <br></br>
            <Tabs>
                <TabList>
                    <Tab> Daily New Cases </Tab>
                    <Tab> Graph Cases Data</Tab>
                </TabList>
                <TabPanel>
                    {displayTodayInfo()}
                </TabPanel>
                <TabPanel>
                    <div>
                        {showGraph()}
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    )
};

