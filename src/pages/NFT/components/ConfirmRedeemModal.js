import React from "react";
import { useTranslation } from "react-i18next";
import Button from "components/Button";
import { useConfirmRedeemStyles } from "../style";
import { Typography } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

function ConfirmRedeemModal({ card, onConfirm, loading }) {
  const { t } = useTranslation();
  const classes = useConfirmRedeemStyles();

  return (
    <div>
      <Typography variant="h6">{t("nft.redeem.modal.title")}</Typography>
      <br />
      <div className={classes.bodyContainer}>
        <Card key={"card_" + card.id} className={classes.cardRoot}>
          <CardMedia
            // className={classes.cardMedia}
            // image={card.previewImage ? card.previewImage : card.image}
            // title={card.description}
            // playsInline
            // muted
            image={card.previewImage}
            component={"div"}
          />
        </Card>
        <Typography variant="h4">{card.name}</Typography>
        <Typography variant="body2">{card.description}</Typography>
        <Typography className="text-highlight" variant="h6">
          {card.points} Samurai
        </Typography>
        <Button loading={loading} onClick={onConfirm}>
          {t("nft.redeem.modal.button")}
        </Button>
      </div>
    </div>
  );
}

export default ConfirmRedeemModal;
