import React from "react";
import OrangTua from "./OrangTua";
import Kader from "./Kader";

export default function Dashboard() {
  const userRole = 'Orang Tua'; 
  

  if (userRole === 'Kader') {
    return <Kader />;
  }
  
  return <OrangTua />;
}
