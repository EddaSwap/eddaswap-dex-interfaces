import { Divider, Typography } from "@material-ui/core";
import {
  acceptListUpdate,
  disableList,
  enableList,
  removeList,
} from "actions/lists";
import Button from "@material-ui/core/Button";
import SwithButton from "components/SwitchButton";
import { useIsListActive } from "hooks/useTokens";
import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import listVersionLabel from "utils/listVersionLabel";
import { parseENSAddress } from "utils/parseENSAddress";
import uriToHttp from "utils/uriToHttp";
import { useFetchListCallback } from "../../hooks/useFetchListCallback";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import TextInput from "components/TextInput";
import classnames from "classnames";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

export const useStyles = makeStyles((theme) => ({
  listRow: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    justifyContent: "space-between",
  },
  arrowButton: {
    margin: 0,
    padding: 0,
    width: "fit-content",
  },
  popoverContainer: {
    padding: 20,
  },
  listInfo: {
    display: "flex",
    alignItems: "center",
  },
  tempListContainer: {
    backgroundColor: theme.palette.common.light,
    padding: 10,
    borderRadius: 20,
  },
}));

function listUrlRowHTMLId(listUrl) {
  return `list-row-${listUrl.replace(/\./g, "-")}`;
}

const ListRow = memo(function ListRow({ listUrl, onBack }) {
  const classes = useStyles();

  const listsByUrl = useSelector((state) => state.lists.byUrl);
  const dispatch = useDispatch();
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl];

  const isActive = useIsListActive(listUrl);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? list.name : undefined;

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return;

    dispatch(acceptListUpdate(listUrl));
  }, [dispatch, listUrl, pending]);

  const handleRemoveList = useCallback(() => {
    if (
      window.prompt(
        `Please confirm you would like to remove this list by typing REMOVE`
      ) === `REMOVE`
    ) {
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl]);

  const handleEnableList = useCallback(() => {
    dispatch(enableList(listUrl));
  }, [dispatch, listUrl]);

  const handleDisableList = useCallback(() => {
    dispatch(disableList(listUrl));
  }, [dispatch, listUrl]);

  const onToggleList = () => {
    if (isActive) {
      handleDisableList();
    } else {
      handleEnableList();
    }
  };
  if (!list) return null;

  return (
    <div
      key={listUrl}
      align="center"
      padding="16px"
      id={listUrlRowHTMLId(listUrl)}
      className={classes.listRow}
    >
      <Box className={classes.listInfo}>
        {list.logoURI ? (
          <img
            style={{ marginRight: "1rem", width: "50px" }}
            logoURI={list.logoURI}
            src={list.logoURI}
            alt={`${list.name} list logo`}
          />
        ) : (
          <div style={{ width: "24px", height: "24px", marginRight: "1rem" }} />
        )}

        <Typography>{list.name}</Typography>
        <Button
          className={classes.arrowButton}
          variant="text"
          onClick={handleClick}
          aria-describedby={id}
        >
          <ExpandMoreIcon className="icons" />
        </Button>
      </Box>

      <SwithButton label="Active" onChange={onToggleList} checked={isActive} />

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box className={classes.popoverContainer}>
          <div>{list && listVersionLabel(list.version)}</div>
          <Divider />
          {/* <a href={`https://tokenlists.org/token-list?url=${listUrl}`}>
            View list
          </a> */}
          <Button
            variant="contained"
            onClick={handleRemoveList}
            disabled={Object.keys(listsByUrl).length === 1}
          >
            Remove list
          </Button>
          {pending && (
            <Button onClick={handleAcceptListUpdate}>Update list</Button>
          )}
        </Box>
      </Popover>
    </div>
  );
});

export default function ListSelect({
  onDismiss,
  onBack,
  setImportList,
  setListUrl,
}) {
  const [listUrlInput, setListUrlInput] = useState("");
  const classes = useStyles();

  const lists = useSelector((state) => state.lists.byUrl);
  console.log(
    "state",
    useSelector((state) => state)
  );
  // temporary fetched list for import flow
  const [tempList, setTempList] = useState();
  const [addError, setAddError] = useState();

  const handleInput = useCallback((value) => {
    setListUrlInput(value);
  }, []);
  const fetchList = useFetchListCallback();

  const validUrl = useMemo(() => {
    return (
      uriToHttp(listUrlInput).length > 0 ||
      Boolean(parseENSAddress(listUrlInput))
    );
  }, [listUrlInput]);

  useEffect(() => {
    async function fetchTempList() {
      fetchList(listUrlInput, false)
        .then((list) => setTempList(list))
        .catch(() => setAddError(`Error importing list`));
    }
    // if valid url, fetch details for card
    if (validUrl) {
      fetchTempList();
    } else {
      setTempList(undefined);
      listUrlInput !== "" && setAddError(`Enter valid list location`);
    }

    // reset error
    if (listUrlInput === "") {
      setAddError(undefined);
    }
  }, [fetchList, listUrlInput, validUrl]);
  const isImported = Object.keys(lists).includes(listUrlInput);

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    if (!tempList) return;
    setImportList(tempList);
    setListUrl(listUrlInput);
  }, [listUrlInput, setImportList, setListUrl, tempList]);

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists);
    return listUrls
      .filter((listUrl) => {
        return Boolean(lists[listUrl].current);
      })
      .sort((u1, u2) => {
        const { current: l1 } = lists[u1];
        const { current: l2 } = lists[u2];
        if (l1 && l2) {
          return l1.name.toLowerCase() < l2.name.toLowerCase()
            ? -1
            : l1.name.toLowerCase() === l2.name.toLowerCase()
            ? 0
            : 1;
        }
        if (l1) return -1;
        if (l2) return 1;
        return 0;
      });
  }, [lists]);

  return (
    <div style={{ width: "100%", flex: "1 1" }}>
      <Divider />
      <TextInput placeholder="https:// or ipfs://" onChange={handleInput} />
      {addError ? <Typography error>{addError}</Typography> : null}
      {tempList && (
        <Box className={classnames(classes.listRow, classes.tempListContainer)}>
          <Box className={classes.listInfo}>
            {tempList.logoURI && (
              <img
                style={{ marginRight: "1rem", width: "50px", height: "50px" }}
                logoURI={tempList.logoURI}
                src={tempList.logoURI}
                alt={`${tempList.name} list logo`}
              />
            )}
            <Typography fontWeight={600}>{tempList.name} </Typography>
            <Typography variant="caption" style={{ marginLeft: 20 }}>
              ({tempList.tokens.length} tokens)
            </Typography>
          </Box>
          {isImported ? (
            <Box style={{ display: "flex" }}>
              <CheckCircleOutlineIcon className="icons" />
              <Typography variant="body2" style={{ marginRight: "16px" }}>
                Loaded
              </Typography>
            </Box>
          ) : (
            <Button
              style={{ fontSize: "14px", marginRight: "16px" }}
              padding="6px 8px"
              width="fit-content"
              onClick={handleImport}
            >
              Import
            </Button>
          )}
        </Box>
      )}
      {/* <ListContainer> */}
      {sortedLists.map((listUrl) => (
        <ListRow key={listUrl} listUrl={listUrl} onBack={onBack} />
      ))}
      {/* </ListContainer> */}
      <Divider />
    </div>
  );
}
