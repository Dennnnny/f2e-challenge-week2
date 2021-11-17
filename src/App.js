import {useEffect} from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import styled from 'styled-components'
import logo from './logo.svg';
import './App.css';

const Style = styled.div`
  div.header {
    background-color: #fff;
  }

  div.nav {
    background-color: #F25C54;
    color: #fff;
  }

  div#map {
   height: calc( 100vh - 120px);
   
    div.input {
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      text-align: center;
      z-index: 500;
    }
  }
`


L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
function App() {

  useEffect(()=>{

    let map = L.map("map",{gestureHandling:true, zoomControl: false}).setView([24.805, 121.09], 16);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZGVubm5ueSIsImEiOiJja3cwc2VuYWUxYjc0Mm9tcWc0YWRxOWx6In0.dYbG-41__b453IpMf5nW2A'
    }).addTo(map);

    return () => map.remove()
  },[])

  return (
    <Style>
      <div className="header" style={{height:"60px",width:"100%"}}>
        Bike
      </div>
      <div className="nav" style={{height:"60px",width:"100%"}}>
        Youbike 租借站點
      </div>

      <div id="map">
        <div className="input">
          <input placeholder="search...." />
        </div>
      </div>
    </Style>
  );
}

export default App;
