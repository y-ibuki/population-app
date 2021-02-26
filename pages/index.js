import React, { useState, useEffect } from 'react'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from "axios";
import styled from "styled-components";

const CheckBox = styled.input.attrs( () => ({
  type: 'checkbox',
}))`
  font-size: 30px;
  margin-right: 5px;
`

const Label = styled.label`
  font-size: 18px;
  vertical-align: middle;
  margin-left: 10px;
`

const PrefWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 0 30px;
`

export default function Home() {
  const prefectureUrl = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
  const populationUrl = 'https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const [pref, setPref] = useState([])
  const [popByPref, setPopByPref] = useState([])
  const [selectedPref, setSelectedPref] = useState([])
  useEffect( () => {
    // 都道府県取得
    const prefectures = axios.get( prefectureUrl, { headers: { 'X-API-KEY': apiKey } })
    prefectures.then( res => {
      const prefData = res.data.result
      setPref(prefData)
    })
  }, [])

  function addPopulation(prefCode, prefName) {
    const populationByPrefecture =
      axios.get( populationUrl + '?cityCode=-&prefCode=' + prefCode, { headers: { 'X-API-KEY': apiKey } })

    populationByPrefecture.then( i => {
      const data = i.data.result.data[0].data
      const populationArray = []
      data.map( i => {
        populationArray.push(i.value)
      })

      const popByPrefData = {name: prefName, data: populationArray}
      setPopByPref([...popByPref, popByPrefData])
    })
  }

  function deletePopulation(prefCode, prefName) {
    const popByPrefCopy = popByPref.slice()
    const selectedPrefCopy = selectedPref.slice()
    popByPref.map( (i, index) => {
      if (i.name === prefName) {
        popByPrefCopy.splice(index, 1)
        setPopByPref(popByPrefCopy)
      }
    })

    selectedPref.map( (i, index) => {
      if (i === prefCode) {
        selectedPrefCopy.splice(index, 1)
        setSelectedPref(selectedPrefCopy)
      }
    })
  }

  function onClick(e) {
    const prefValue = e.target.value.split(',')
    const prefCode = prefValue[0]
    const prefName = prefValue[1]
    if (selectedPref.includes(prefCode)) {
      // チェックを外した時
      deletePopulation(prefCode, prefName)
    } else {
      // チェックした時
      setSelectedPref([...selectedPref, prefCode])
      addPopulation(prefCode, prefName)
    }
  }

  const options = {
    title: {
      text: '総人口率'
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        pointInterval: 5,
        pointStart: 1965
      }
    },
    series: popByPref
  };

  return (
    <div className="App">
      <PrefWrapper>
        {
          pref.map( ({prefCode, prefName}) => {
            return (
              <Label key={prefCode}>
                <CheckBox value={[prefCode, prefName]} onClick={onClick} />{prefName}
              </Label>
            )
          })
        }
      </PrefWrapper>
      <HighchartsReact highcharts={Highcharts} options={options}></HighchartsReact>
    </div>
  )
}
