const Sidebar = () =>{
    return(
        <div style = {styles.header} >
            <div style = {styles.brand}> Open Audit </div>
            <nav style = {styles.navigate}>
                <a href = "/dashboard" style={styles.link}> Dashboard </a>
                <a href = "/" style={styles.link}> Profile </a>
                <a href = "/" style={styles.link}> Settings </a>
            </nav>
        </div>
    );
}
const styles = {
    header:{},
    brand:{},
    navigate:{},
    link:{}
}
export default Sidebar;