import {useCallback, useEffect, useRef, useState} from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { GestureHandling } from "leaflet-gesture-handling"
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css"
import styled from "styled-components"
import { IoCloudOutline, IoLocationSharp, IoNavigate, IoSearchOutline, IoThermometerOutline } from "react-icons/io5"
import { isEmpty, isNil, map as Rmap, path, unnest } from "ramda"
import "./App.css"
import { GetAuthorizationHeader } from "./tool/tool"

const Style = styled.div`
  div.header {
    background-color: #fff;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;

    > div.weather {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      line-height: 17px;
      color: #747578;

      > div {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    > div.logo {
      font-family: "Noto Sans TC";
      font-style: normal;
      font-weight: normal;
      font-size: 18px;
      line-height: 26px;
      color: #F25C54;
      position: relative;
      width: fit-content;

      :before {
        content:"";
        width: 9px;
        height: 9px;
        border-radius: 100%;
        background-color: #F25C54;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: -14px;
      }
      :after {
        content:"";
        width: 7px;
        height: 7px;
        border-radius: 100%;
        background-color: #F25C54;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: -24px;
      }
    }
  }

  div.nav {
    background-color: #F25C54;
    color: #fff;
    list-style: none;
    display: flex;
    gap: 16px;
    justify-content: space-around;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;
    li {
      text-align: center;
      font-family: "Archivo";
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 15px;
      color: #F8F8F8;
      padding: 22px 10px;
      width: max-content;

      :nth-child(2){
        text-align: right;
      }
    }
    li.active {
      font-weight: bold;
      color: #fff;
    }
  }

  div#map {
   height: calc( 100vh - 59px - 66px);
   
    div.input {
      position: absolute;
      top: 20px;
      left: 30px;
      right: 30px;
      text-align: center;
      z-index: 500;

      .search-bar {
        position: relative;
        display: flex;
        justify-content: space-between;

        input {
          padding: 16px;
          width: fill-available;
          border-radius: 10px;
          border: none;
          -webkit-appearance: textfield;
          /* pointer-events:  */
        }

        svg {
          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          color: #fff;
          background-color: #F25C54;

          padding: 10px;
          border: 30px;
          border: 1px solid #F25C54;
          border-radius: 10px;
        }
      }

      .search-button {
        color: #F25C54;
        font-size: 16px;
        background-color: #fff;
        padding: 8px 16px;
        border-radius: 10px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
        /* pointer-events: none; */
        svg {
          transform: rotate(-90deg);
        }
      }

    }
  }

  div.leaflet-div-icon {
    border: none;
  }

  .pin {
    position: absolute;
    top: 40%;
    left: 50%;
    /* margin-left: 115px; */
    
    border-radius: 50%;
    /* border: 12px solid ; */
    width: 0px;
    height: 0px;
    :after {
      position: absolute;
      content: '';
      width: 0px;
      height: 0px;
      bottom: -30px;
      left: -10px;
      border: 10px solid transparent;
      /* border-top: 17px solid ; */
      border-top-color: inherit;
      border-top-width: 17px;
      border-top-style: solid;
      transform: rotateX(44deg);
    }

    span {
      width: 13px;
      height: 13px;
      background-color: #fff;
      position: absolute;
      border-radius: 100%;
      transform: translate(-50%,-50%);

      span {
        width: 13px;
        height: 13px;
        background-color: #fff;
        position: absolute;
        border-radius: 100%;
        transform: translate(-50%,-50%);
      }
    }
  }

  div.leaflet-popup {
    margin-bottom: 60px;
    div.leaflet-popup-content-wrapper{
      div.leaflet-popup-content {
        margin: -1px;
      }
    }
    div.leaflet-popup-tip{
      display: none;
    }

    .map-popup {
      padding: 16px 21px 16px 16px;
      color: #fff;
      background-color: inherit;
      border-radius: 10px;
    }
  }
  
`

const navList = [
  { displayName:"Youbike 租借站點", },
  { displayName:"自行車路線", },
  { displayName:"美食景點", }
]

L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

function calculatePercentage (item) {
  if(isNil(item.AvailableRentBikes) || isNil(item.BikesCapacity) ) return 0
  return item.AvailableRentBikes === 0
  ? '0%'
  : ((item.BikesCapacity-item.AvailableRentBikes)/item.BikesCapacity)*100 + '%'
}

function App() {

  const [ searchType, setSearchType ] = useState(path([0,"displayName"])(navList))
  const [ showButton ,setShowButton ] = useState(false)
  const [ geoLocation, setGeoLocation ] = useState([25.046273,121.517498])
  const mapRef = useRef(null)
  const bikeData = useRef([])
  
  async function getGeoLocation () {
    try {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
          (res) => setGeoLocation([res.coords.latitude, res.coords.longitude]),
          () => {}
        )
      }
    } catch(e){
      throw new Error(e)
    }
  }

  function drawMap (map) {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiZGVubm5ueSIsImEiOiJja3cwc2VuYWUxYjc0Mm9tcWc0YWRxOWx6In0.dYbG-41__b453IpMf5nW2A'
    }).addTo(map);
  }

  const getBikeStations = useCallback(() => {
    async function getBikeStation () {
      try{
        let stationData = await fetch(
          `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$top=30&$spatialFilter=nearby(${geoLocation[0]},${geoLocation[1]},500)&$format=JSON`,
          {
            headers: GetAuthorizationHeader(),
            method:"GET",
          })
        .then(res=> res.json())
        .then((res)=> res)
        
        let availbleData = await fetch(
          `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$top=30&$spatialFilter=nearby(${geoLocation[0]},${geoLocation[1]},500)&$format=JSON`,
          {
            headers: GetAuthorizationHeader(),
            method:"GET",
          })
        .then(res=> res.json())
        .then((res)=> res)


        
        let bikeStationData = []
        availbleData.map((availableItem) => 
          stationData.filter(item => {
            if(availableItem.StationUID === item.StationUID){
              // console.log('this is availableItem:', availableItem);
              bikeStationData.push({
                ...availableItem,
                BikesCapacity: item.BikesCapacity,
                StationName: item.StationName,
                StationPosition: item.StationPosition
              })

            }
          })
        )

        return bikeStationData
      }catch(e){
        throw new Error(e)
      }
    }

    return getBikeStation()
  },[geoLocation])

  useEffect(()=>{
    mapRef.current = L.map("map",{gestureHandling:true, zoomControl: false}).setView([geoLocation[0] , geoLocation[1] ], 16)
    drawMap(mapRef.current)
    getBikeStations().then(res=> {
      res.map(item => {
        console.log('here::;',item)
          L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon],{
            icon: L.divIcon({
              html: `<div style="border-color:${ item.AvailableRentBikes === 0 ? "#747578" : "#F25C54"};border-width:12px;border-style:solid;" class="pin">
                  <span style="background: conic-gradient( transparent ${calculatePercentage(item)}, #fff ${calculatePercentage(item)}, #fff 100%);"></span>
              </div>`,
              iconSize: [0, 0],
              iconAnchor: [12, 40],
              
            })
          }).addTo(mapRef.current).bindPopup(`
          <div class="map-popup" style="background:${item.AvailableRentBikes === 0 ? "#747578" : "#F25C54"}">
            ${item.StationName.Zh_tw}
            <div>
              可借：${item.AvailableRentBikes} 可停：${item.AvailableReturnBikes}
            </div>
          </div>
          `,{
              'className':"map-popup"
            })
      })
    })

    return () => mapRef.current.remove()
  },[geoLocation,getBikeStations])



  const handleChangeSearchType = (e) => {
    // console.log('this is :', e.target.innerHTML);
    setSearchType(e.target.innerHTML)
  }


  return (
    <Style>
      <div className="header">
        <div className="logo">Bike</div>
        <div className="weather">
          <div className="status"><IoCloudOutline /> 多雲 </div>
          <div className="temperature"><IoThermometerOutline /> 85&#176;C </div>
        </div>
      </div>
      <div className="nav">
        {Rmap(item => (
          <li 
            key={item.displayName}
            className={searchType === item.displayName ? "active":""}
            onClick={handleChangeSearchType}
          >
            {item.displayName}
          </li>
        ))(navList)}
      </div>

      <div id="map">
        <div className="input">
          <div className="search-bar">
            <input 
              type="search"
              placeholder={`搜尋
              ${searchType}`}
              onFocus={() => setShowButton(true)}
              onBlur={() => setShowButton(false)}
              onKeyDown={(e)=>{
                if(e.key === 'Enter'){

                }
              }}
            />
            <IoSearchOutline onClick={()=>{

            }} />
          </div>
          {showButton && 
            <div className="search-button" onClick={()=>{}}>
              <IoNavigate /> 附近 {searchType}
            </div>
          }
        </div>
      </div>
    </Style>
  );
}

export default App;
