import COLOR_MAP from "./config.js";

function ChargingPoint(props) {
    return (
        <div className="cp" style={{backgroundColor: COLOR_MAP[props.cp_state]}} onClick={props.onClick}>
            <h3>{props.cp_id}</h3>
            <p>Estado: {props.cp_state}</p>
            <p>{props.price}€/kWh</p>
            <div style={{display: props.visible ? "block" : "none"}}>
                <p>{props.paired}</p>
                <p>{props.total_charged}kWh</p>
            </div>
        </div>
    )
}

export default ChargingPoint;