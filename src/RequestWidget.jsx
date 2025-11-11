function RequestWidget(props) {
    return (
        <tr>
            <td>{props.req_timestamp}</td>
            <td>{props.driver}</td>
            <td>{props.cp_id}</td>
        </tr>
    );
}

export default RequestWidget;