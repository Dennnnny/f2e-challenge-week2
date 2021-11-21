import {useCallback, useEffect, useRef, useState} from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// import { GestureHandling } from "leaflet-gesture-handling"
// import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css"
import styled from "styled-components"
import { IoCloseSharp, IoCloudOutline, IoInformationCircleOutline, IoNavigate, IoSearchOutline, IoThermometerOutline, IoTriangleSharp } from "react-icons/io5"
import { CgArrowLongRight, CgArrowsExchange } from "react-icons/cg"
import { isEmpty, isNil, path } from "ramda"
import "./App.css"
import { GetAuthorizationHeader,mapIndexed } from "./tool/tool"
import Wkt from "wicket"

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
      cursor: pointer;

      :nth-child(2){
        text-align: right;
      }
    }
    li.active {
      font-weight: bold;
      color: #fff;
    }
  }

  div.map {
    position: relative;
    /* height: calc( 100vh - 59px - 66px); */

    div#map{
      height: calc( 100vh - 59px - 66px);
    }
   
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
          font-size: 16px;
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
          cursor: pointer;

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
        cursor: pointer;
        /* pointer-events: none; */
        svg {
          transform: rotate(-90deg);
        }
      }

      .search-empty {
        color: #fff;
        font-size: 16px;
        padding: 8px 16px;
        border-radius: 10px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
        background-color: #83C5BE;

        svg {
          margin-right: 8px;
        }

      }

    }
  }

  div.route-map {
   height: calc( 100vh - 59px - 66px);
   position: relative;
   background-color: #F8F8F8;

    div#route-map {
      height: calc( 100vh - 59px - 66px);
    }
   
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
          font-size: 16px;
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

        .search-tags{
          span {
            background-color: #83C5BE;
            padding: 12px;
            border-radius: 10px;
            color: #fff;
            margin: 8px;
          }
        }
      }

      .search-route {
        position: relative;
        padding: 20px;
        color: #F25C54;
        font-size: 16px;
        background-color: #fff;
        border-radius: 10px;
        text-align: left;
        gap: 10px;
        margin: 10px 0;

        display: flex;
        flex-direction: column;
        
        > div:nth-child(odd) {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        div.radio-input {
          padding: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: #000;
          label.radio-input-label {
            font-weight: 400;

            /* margin: 0 10px; */
            /* width: 50%; */
          }
        }

        div {
          font-weight: 600;
          button.city-select-btn{
            padding: 12px 8px 12px 16px;
            border: none;
            background: #F8F8F8;
            border-radius: 14px;
            -webkit-appearance: textfield;
            

            svg {
              transform: scale(0.5) rotate(-180deg) translateY(-25%);
            }

          }

          div.order-select{
            position: relative;
            > select {
              background: #F8F8F8;
              border-radius: 14px;
              outline: none;
              border: none;
              -webkit-appearance:none;
              padding: 12px 24px 12px 16px;
              font-size: 16px;

            }
            > svg {
              color: #000;
              position: absolute;
              transform: scale(0.5) rotate(180deg) translateY(-25%);
              right: 8px;
              top: 25%;
            }
          }
        }

        div.submit-setting {
          text-align: right;
          input {
            background-color: #F25C54;
            padding: 8px 12px;
            color: #fff;
            border: none;
            outline: none;
            -webkit-appearance: textfield;
            border-radius: 10px;
          }
        }

        >div.city-select {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 10px;
          background-color: #fff;
          padding: 16px;
          font-size: 16px;

          select {
            width: 100%;
            height: 24px;
            font-size: 16px;
          }

          span.close-city-select-modal {
            position: absolute;
            top: 10px;
            right: 10px;
            color: #747578;
          }
        }

        svg {
          transform: rotate(-90deg);
        }
      }

      .search-empty {
        color: #fff;
        font-size: 16px;
        padding: 8px 16px;
        border-radius: 10px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
        background-color: #83C5BE;

        svg {
          margin-right: 8px;
        }

      }

      .route-result {
        width: 100%;
        height: calc(100vh - 59px - 66px - 100px);
        overflow: scroll;
        background-color: transparent;
        border-radius: 10px;
        padding: 16px;
        margin-top: 16px;

        .route-result-card {
          padding: 16px;
          margin-top: 16px;
          background: #FFFFFF;
          border-radius: 10px;
          cursor: pointer;

          p {
            margin: 8px 0;
          }
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

const distanceOptions = [
  { displayName:"1 公里 以下", value:"CyclingLength le 1000" },
  { displayName:"3 - 5 公里", value:"CyclingLength ge 3000 and CyclingLength le 5000" },
  { displayName:"5 公里 以上", value:"CyclingLength ge 5000" },
  { displayName:"5 - 10 公里", value:"CyclingLength ge 5000 and CyclingLength le 10000" },
  { displayName:"10 公里 以上", value:"CyclingLength ge 10000" },

]

const citysWithBikeRoute = [
  {displayName:"臺中市", value:"Taichung"},
  {displayName:"基隆市", value:"Keelung"},
  {displayName:"新竹縣", value:"HsinchuCounty"},
  {displayName:"苗栗縣", value:"MiaoliCounty"},
  {displayName:"彰化縣", value:"ChanghuaCounty"},
  {displayName:"新北市", value:"NewTaipei"},
  {displayName:"南投縣", value:"NantouCounty"},
  {displayName:"雲林縣", value:"YunlinCounty"},
  {displayName:"嘉義縣", value:"ChiayiCounty"},
  {displayName:"嘉義市", value:"Chiayi"},
  {displayName:"屏東縣", value:"PingtungCounty"},
  {displayName:"宜蘭縣", value:"YilanCounty"},
  {displayName:"花蓮縣", value:"HualienCounty"},
  {displayName:"臺東縣", value:"TaitungCounty"},
  {displayName:"金門縣", value:"KinmenCounty"},
  {displayName:"澎湖縣", value:"PenghuCounty"},
  {displayName:"桃園市", value:"Taoyuan"},
  {displayName:"臺北市", value:"Taipei"},
  {displayName:"高雄市", value:"Kaohsiung"},
  {displayName:"臺南市", value:"Tainan"}
]

const transformCityValueToDisplayName = (value) => {
  return citysWithBikeRoute.filter(item => item.value === value)[0].displayName
}

const tansformDistanceFilter = (value) => {
  return distanceOptions.filter(item => item.value === value)[0].displayName
}

function calculatePercentage (item) {
  if(isNil(item.AvailableRentBikes) || isNil(item.BikesCapacity) ) return 0
  return item.AvailableRentBikes === 0
  ? '0%'
  : ((item.BikesCapacity-item.AvailableRentBikes)/item.BikesCapacity)*100 + '%'
}

function App() {

  const [ searchType, setSearchType ] = useState(path([0,"displayName"])(navList))
  const [ showButton ,setShowButton ] = useState(false)
  const [ shoeEmptyResult, setShowEmptyResult] = useState(null)
  const [ geoLocation, setGeoLocation ] = useState([25.046273,121.517498])
  const [ cityModalOpen, setCityModalOpen ] = useState(false)
  const mapRef = useRef(null)
  const bikeRouteRef = useRef(null)
  const [chooseRoute,setChooseRoute] = useState(null)
  const [ bikeRouteList, setBikeRouteList ] = useState([])
  const [ bikeRouteObject, setBikeRouteObject ] = useState({
    city: "Taipei",
    filter: "CyclingLength le 1000",
    orderBy:"CyclingLength asc"
  })
  const [ bikeRouteData, setBikeRouteData ] = useState(null)

  async function getGeoLocation () {
    try {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
          (res) => {setGeoLocation([res.coords.latitude, res.coords.longitude])},
          () => {}
        )
      }
    } catch(e){
      throw new Error(e)
    }
  }

  function drawMap (map) {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '&copy; Design by <a href="https://www.figma.com/file/zmcW9WenYEJubgYIY4Usqo/Week2---%E8%87%AA%E8%A1%8C%E8%BB%8A%E9%81%93%E5%9C%B0%E5%9C%96%E8%B3%87%E8%A8%8A%E6%95%B4%E5%90%88%E7%B6%B2">Zoe Kang</a>, Code by <a href="https://github.com/Dennnnny/f2e-challenge-week2">Denny</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiZGVubm5ueSIsImEiOiJja3cwc2VuYWUxYjc0Mm9tcWc0YWRxOWx6In0.dYbG-41__b453IpMf5nW2A'
    }).addTo(map);
  }

  function drawStation(list) {
    return list.forEach(item => {
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
  }

  const getBikeStations = useCallback(() => {
    async function getBikeStation () {
      try{
        let stationData = await fetch(
          `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$spatialFilter=nearby(${geoLocation[0]},${geoLocation[1]},1000)&$format=JSON`,
          {
            headers: GetAuthorizationHeader(),
            method:"GET",
          })
        .then(res=> res.json())
        .then((res)=> res)
        
        let availbleData = await fetch(
          `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$spatialFilter=nearby(${geoLocation[0]},${geoLocation[1]},1000)&$format=JSON`,
          {
            headers: GetAuthorizationHeader(),
            method:"GET",
          })
        .then(res=> res.json())
        .then((res)=> res)
        
        let bikeStationData = []
        availbleData.map((availableItem) => 
          stationData.forEach(item => {
            if(availableItem.StationUID === item.StationUID){

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

  const getBikeRoutes = useCallback(()=>{
    async function getBikeRoute () {
      try {

        let routeList = await fetch(
          `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${bikeRouteData.city}?$filter=${bikeRouteData.filter}&$orderby=${bikeRouteData.orderBy}&$top=30&$format=JSON
          `,
          {
            headers: GetAuthorizationHeader(),
            method:"GET",
          }).then(res => res.json())
          .then(res => res)

        return routeList
      }catch(e){
        throw new Error(e)
      }
    }

    if(isNil(bikeRouteData)) return
    return getBikeRoute()
  },[bikeRouteData])

  useEffect(()=>{

    if(searchType !== path([0,"displayName"])(navList)) return

    mapRef.current = L.map("map",{gestureHandling:true, zoomControl: false}).setView([geoLocation[0] , geoLocation[1] ], 16)
    drawMap(mapRef.current)

    getBikeStations().then(res=> {

      if(isEmpty(res)){
        setShowEmptyResult(true)
        return
      }

      drawStation(res)
    })

    return () => mapRef.current.remove()
  },[geoLocation,getBikeStations,searchType])

  useEffect(()=>{

    if(searchType !== path([1,"displayName"])(navList)) return

    if(isNil(bikeRouteData)) return

    getBikeRoutes().then(res=>{
      setBikeRouteList(res)
    })

  },[searchType,getBikeRoutes,geoLocation,bikeRouteData])

  let routeLayer = useRef(null)

  useEffect(()=>{
    if(isNil(chooseRoute)) return

    if(routeLayer.current){
      bikeRouteRef.current.removeLayer(routeLayer.current)
    }

    bikeRouteRef.current = L.map("route-map",{gestureHandling:true, zoomControl: false}).setView([geoLocation[0] , geoLocation[1] ], 16)
    drawMap(bikeRouteRef.current)

    const wicket = new Wkt.Wkt()
    const geojson = wicket.read(chooseRoute.geo).toJson()

    routeLayer.current = L.geoJSON(geojson).addTo(bikeRouteRef.current)
    routeLayer.current.addData(geojson)

    bikeRouteRef.current.fitBounds(routeLayer.current.getBounds())

    return () => bikeRouteRef.current.remove()
  },[chooseRoute, geoLocation])


  const handleChangeSearchType = (e) => {
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
        {mapIndexed((item,index) => (
          <li 
            key={index}
            className={searchType === item.displayName ? "active":""}
            onClick={handleChangeSearchType}
          >
            {item.displayName}
          </li>
        ))(navList)}
      </div>

      { searchType === path([0,"displayName"])(navList) && 
      <div className="map">
        <div id="map"/>
        <div className="input">
          <div className="search-bar">
            <input 
              type="search"
              placeholder={`搜尋
              ${searchType}`}
              onFocus={() => setShowButton(true)}
              onKeyDown={(e)=>{
                if(e.key === 'Enter'){

                }
              }}
            />
            <IoSearchOutline onClick={()=>{

            }} />
          </div>
          {showButton && 
            <div className="search-button" onClick={()=> getGeoLocation() }>
              <IoNavigate /> 附近 {searchType}
            </div>
          }
          {shoeEmptyResult && 
            <div className="search-empty" onClick={()=>{}}>
              <IoInformationCircleOutline /> 附近目前沒有可以租借車輛的租借站
            </div>
          }
        </div>
      </div>}
      { searchType === path([1,"displayName"])(navList) && 
      <div className="route-map">
        <div id="route-map" />
        <div className="input">
          <div className="search-bar">
            {!isNil(chooseRoute)
            ?<div className="search-tags"> 
              <span>{chooseRoute.city}</span>
              <span>{chooseRoute.distanceTag}</span>
            </div>
            
            :<input 
              //autoFocus
              type="search"
              placeholder={`搜尋
              ${searchType}`}
              onFocus={() => setShowButton(true)}
              onKeyDown={(e)=>{
                if(e.key === 'Enter'){

                }
              }}
            />
            }
            <IoSearchOutline onClick={()=>{
              setShowButton(true)
              setBikeRouteList([])
            }} />
          </div>
          {(showButton)&&
            <div className="search-route" onClick={()=> {} }>
              <div>城市 
                  <button 
                    className="city-select-btn"
                    type="button"
                    onClick={()=>setCityModalOpen(true)}
                  >
                    {!isEmpty(bikeRouteObject.city) ? transformCityValueToDisplayName(bikeRouteObject.city) :"選擇"} <IoTriangleSharp />
                  </button>
              </div>
              <div>距離
                <div className="radio-input">
                  {mapIndexed((item,index) => {
                    return <label key={index} className="radio-input-label"><input onChange={(e)=>setBikeRouteObject(prev => ({...prev,filter:item.value}))} defaultChecked={item.value === distanceOptions[0].value} type="radio" name="distance" value={item.value} />{item.displayName}</label>
                  })(distanceOptions)}
                </div>
              </div>
              <div>
                排序
                <div className="order-select">
                  <select 
                    onChange={(e)=>
                      setBikeRouteObject(prev => ({...prev,orderBy:e.target.value}))
                    }
                  >
                    <option value="CyclingLength asc">騎乘距離由短至長</option>
                    <option value="CyclingLength desc">騎乘距離由長至短</option>
                  </select>
                  <IoTriangleSharp />
                </div>
              </div>
              <div className="submit-setting"><input type="button" value="送出" onClick={()=>{
                setBikeRouteData(bikeRouteObject)
                setShowButton(false)
                }}/> </div>
              {
                cityModalOpen && 
                <div className="city-select">
                  <span className="close-city-select-modal" onClick={()=>setCityModalOpen(false)}><IoCloseSharp /></span>
                  <select
                    value={bikeRouteObject.city}
                    onChange={(e)=>{
                      setBikeRouteObject(prev => ({...prev,city:e.target.value}))
                      setCityModalOpen(false)
                    }}
                  >
                    {mapIndexed((item,index) => {
                      return <option key={index} value={item.value} > {item.displayName} </option>
                    })(citysWithBikeRoute)}
                  </select>
                </div>
              }
            </div>
          }
          {
            !isEmpty(bikeRouteList) &&
            <div className="route-result">
              {mapIndexed( (item,index) => {
                return (
                  <div key={index} className="route-result-card" onClick={()=> {
                    setChooseRoute(prev => ({...prev,geo:item.Geometry,city:item.City,distanceTag:tansformDistanceFilter(bikeRouteObject.filter)}))
                    setBikeRouteList([])
                  }}>
                    <p>{item.RouteName}</p>
                    <p>{item.RoadSectionStart || "起點"} {item.Direction === "雙向" ? <CgArrowsExchange /> : <CgArrowLongRight /> } {item.RoadSectionEnd || "終點"} </p>
                    <p>騎乘距離：{(item.CyclingLength)/1000}公里</p>
                  </div>
                )
              })(bikeRouteList)}
            </div>
          }
        </div>
      </div>}
    </Style>
  );
}

export default App;
