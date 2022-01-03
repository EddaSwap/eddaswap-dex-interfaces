import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import Pagination from '../Pagination/index'
import Thead from './Thead'
import TBody from './TBody'


export default class Table extends React.Component {
    constructor(props) {
        super(props)
        //declare state
        this.state = {
            headers: props.headers || [],
            data: props.data || [],
            pureData: [...props.data] || [],
            pageLength: this.props.pagination.pageLength || 5,
            currentPage: 1,
            pagedData: props.data,
            isExpandedDataLoading: false,
            expandedIndex: -1,
            isExpandedRowOpen: false,
            noDataText: props.noDataText || "No Result"


        }
        this.width = props.width || "100%";
        this.setState = this.setState.bind(this);
        // Add pagination support
        this.pagination = this.props.pagination || {};

    }

    getPagedData = (pageNo, pageLength) => {
        let startOfRecord = (pageNo - 1) * pageLength;
        let endOfRecord = startOfRecord + pageLength;
        let data = this.state.data;
        let pagedData = data.slice(startOfRecord, endOfRecord);
        return pagedData;
    }

    onPageLengthChange = (pageLength) => {
        this.setState({
            pageLength: parseInt(pageLength, 10)
        }, () => {
            this.onGotoPage(this.state.currentPage);
        });
    }

    onGotoPage = (pageNo) => {
        if (!this.props.pagination.enabled) { }
        else {
            let pagedData = this.getPagedData(pageNo, this.state.pageLength);
            this.setState({
                pagedData: pagedData,
                currentPage: pageNo
            });
        }
    }

    componentDidMount() {
        if (this.pagination.enabled) {
            this.onGotoPage(this.state.currentPage);
        }
    }
    componentDidUpdate(prevProps,prevState)
    {
        if(this.props !== prevProps)
        {
            this.setState({
                data:this.props.data,
                pureData:[...this.props.data]
            })
        }
    }


    renderNoData = () => {
        return (
            <p style={{ textAlign: "center" }}>{this.state.noDataText}</p>
        );
    }

    renderTable = () => {
        let title = this.props.title || "";
        let contentView = this.state.data.length > 0
            ? <TBody headers={this.state.headers} data={this.state.data} getExpandedItem={this.props.getExpandedItem} pagedData={this.state.pagedData} pagination={this.props.pagination} hasExpand={this.props.hasExpand} onRowClick={this.props.onRowClick}></TBody>
            : this.renderNoData();
        return (
            <Fragment>

                <span className="data-table__title">
                    {title}
                </span>

                <div className="data-inner-table">
                    <div className={this.props.hasHeader ? `thead` : "thead disappear"}>
                        <Thead headers={this.props.headers} data={this.props.data} pureData={this.state.pureData} pagination={this.props.pagination} onGotoPage={this.onGotoPage} setState={this.setState} hasHeader pagedData={this.state.pagedData} currentPage={this.state.currentPage}  ></Thead>
                    </div>
                    <div className="tbody" >
                        {contentView}
                    </div>
                </div>
            </Fragment>
        );

    }
    renderTableClassName() {
       
        if (this.props.className) {
            return this.props.hasExpand
                ? `${this.props.className}-expand`
                : `${this.props.className}`
        }
        else {
            return this.props.hasExpand
                ? `defaultTable-expand`
                : `defaultTable`
        }
    }
    render() {
        const {data,pageLength,currentPage}=this.state
        const {pagination}=this.props
        return (
            <Fragment>
                <div className={this.renderTableClassName()} >
                    {this.renderTable()}
                    {this.pagination.enabled &&
                        <Pagination
                            type={pagination.type}
                            totalRecords={data.length}
                            pageLength={pageLength}
                            onPageLengthChange={this.onPageLengthChange}
                            onGotoPage={this.onGotoPage}
                            currentPage={currentPage}
                        />
                    }
                </div>
            </Fragment>

        )
    }
}


