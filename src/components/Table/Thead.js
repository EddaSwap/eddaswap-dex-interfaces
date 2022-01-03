import React, { Component, Fragment } from 'react'

export default class Thead extends Component {
    constructor(props) {
        super(props)
        this.state = {
            headers: props.headers || [],
            toggle: 0,
            activeColumn: -1,
            lastActiveColumn: -1,
            pureData: props.pureData || [],
            pageLength: this.props.pagination.pageLength || 5,
            pagedData: props.data,
        }
    }
    sortByColumn(colIndex, reverse) {
        let data = [...this.state.pureData]
        if (reverse === 1) {

            data.sort((a, b) => {
                if (a[colIndex] === b[colIndex]) {
                   

                    return 0;
                } else {
                    return (a[colIndex] < b[colIndex]) ? -1 : 1;

                }
            }).reverse()
        }
        else {

            data.sort((a, b) => {
                if (a[colIndex] === b[colIndex]) {
                    return 0;
                } else {
                    return (a[colIndex] < b[colIndex]) ? -1 : 1;
                }
            })
        }
        return data
    }

    handleClick(title, key, sortable) {
        if (sortable) {
            if (this.state.activeColumn === -1 || this.state.toggle === 0) {
                this.setState({
                    toggle: 1,
                    activeColumn: key,
                })
                this.props.setState({
                    data: this.sortByColumn(title, 1),
                }, () => {

                    this.props.onGotoPage(this.props.currentPage)
                })
            }
            if (this.state.activeColumn === key && this.state.toggle === 1) {
                this.setState({
                    toggle: 2,
                    activeColumn: key,
                })
                this.props.setState({
                    data: this.sortByColumn(title, 2),
                }, () => {
                    this.props.onGotoPage(this.props.currentPage)
                })
            }
            if (this.state.activeColumn === key && this.state.toggle === 2) {
                this.setState({
                    toggle: 0,
                    activeColumn: key,
                })
                this.props.setState({
                    data: this.state.pureData
                }, () => {
                    this.props.onGotoPage(this.props.currentPage)
                })
            }
            if (this.state.activeColumn !== key && this.state.activeColumn !== -1) {
                this.props.setState({
                    toggle: 1,
                    activeColumn: key,
                    data: this.sortByColumn(title, 1),
                    
                })

            }

        }
    }

    renderSortToggle = (index) => {
        let icon = ""
        if (this.state.activeColumn == index) {
            if (this.state.toggle === 1) {
                icon = "↓"
            }
            else if (this.state.toggle === 2) {
                icon = "↑"
            }
            else if (this.state.toggle = 0) {
                icon = ""
            }
        }
        else {
            icon = ""
        }
        return (<span>{icon}</span>)

    }

    renderTableHeader = () => {
        let { headers } = this.state
        //sort header by index
        headers.sort((a, b) => {
            if (a.index > b.index) return 1;
            return -1;
        });

        let headerView = headers.map((header, index) => {
            let title = header.title;
            let cleanTitle = header.value;
            let width = header.width;
            let toggleIcon = this.renderSortToggle(index)
            return (
                <div
                    onClick={() => this.handleClick(cleanTitle, index, header.sortable)}
                    className="th"
                    ref={(th) => this[cleanTitle] = th}
                    style={{ width: width }}
                    key={index}
                >
                    <span className="header-cell">
                        {title}
                        {toggleIcon}
                    </span>
                </div>
            );
        })

        return headerView

    }

    render() {
        
        return (
            <Fragment>
                
                    <div className="tr">
                        {this.renderTableHeader()}
                    </div>
               
            </Fragment>


        )
    }
}
