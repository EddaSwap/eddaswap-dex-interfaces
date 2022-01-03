import React, { Component, Fragment } from 'react'

export default class TBody extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isExpandedDataLoading: false,
            expandedIndex: -1,
            isExpandedRowOpen: false
        }

    }

    onRowClick = (data, rowIdx) => {
        // if (this.props.hasExpand) {
        //     if (rowIdx === this.state.expandedIndex) {
        //         if (this.state.isExpandedRowOpen === true) {
        //             this.setState({ isExpandedRowOpen: false })
        //         }
        //         else {
        //             this.setState({ isExpandedRowOpen: true })
        //         }

        //     }
        //     else if (rowIdx !== this.state.expandedIndex) {
        //         this.setState({ expandedIndex: rowIdx, isExpandedRowOpen: true })
        //     }
        // }
        // else if(this.props.onRowClick)
        // {
        //     this.props.onRowClick(data)
        // }
        // else
        // {
        //     console.log("Do nothing")
        // }
       


    }

    renderContent = () => {
        let { getExpandedItem = (value) => { }, headers } = this.props
        let data = this.props.pagination.enabled ? this.props.pagedData
            : this.props.data;
        let contentView = data.map((row, rowIdx) => {
            let tds = headers.map((header, index) => {
                let content = row[header.value];
                let cell = header.cell;
                if (cell) {
                    content = cell(row);
                }
                return (
                    <div className="td" data-label={header.title} style={{ width: `${header.width}` }}>
                        {content}
                    </div>
                );
            });
            return (
                <Fragment>
                    <div onClick={() => this.onRowClick(row, rowIdx)} className={this.state.isExpandedRowOpen && this.state.expandedIndex === rowIdx ? "tr open" : "tr"} >
                        {this.props.hasExpand ? <Fragment>
                            <div className="expanded-body flex justify-content-center">
                                <img id="expand-icon" src="/images/icon/small-triangle-right.png"></img>
                            </div>

                        </Fragment> : ""}{tds}
                    </div>
                    {
                        this.state.expandedIndex === rowIdx && this.state.isExpandedRowOpen

                            ? <div className="expanded-row">
                                {getExpandedItem(row)}
                            </div>
                            : ""
                    }

                </Fragment>

            );
        });
        return contentView;
    }
    render() {
        return (
            <Fragment>
                {this.renderContent()}
            </Fragment>
        )
    }
}
