import update from "immutability-helper";
import { useCallback } from "react";
import Card from "./Card";

const normalizeImageList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((item) => typeof item === "string" && item);
  if (typeof val === "string" && val.trim()) return [val];
  return [];
};

const Container = ({ setImageUrl, imageUrl, handleRemoveImage }) => {
  const images = normalizeImageList(imageUrl);
  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      setImageUrl((prevCards) => {
        const list = normalizeImageList(prevCards);
        return update(list, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, list[dragIndex]],
          ],
        });
      });
    },
    [setImageUrl]
  );

  const renderCard = useCallback(
    (card, i) => {
      return (
        <Card
          key={i + 1}
          index={i}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
          image={card}
          handleRemoveImage={handleRemoveImage}
        />
      );
    },
    [moveCard, handleRemoveImage]
  );
  return <>{images.map((card, i) => renderCard(card, i))}</>;
};

export default Container;
