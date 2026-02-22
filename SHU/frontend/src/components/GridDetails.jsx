import '../styles/GridDetails.css'

const GridDetails = () => {
    return (
        <div className="grid-details">
            {/* Горизонтальные линии */}
            <div className="grid-line horizontal-25" />
            <div className="grid-line horizontal-50" />
            <div className="grid-line horizontal-75" />

            {/* Вертикальные линии */}
            <div className="grid-line vertical-25" />
            <div className="grid-line vertical-50" />
            <div className="grid-line vertical-75" />

            {/* Плюсики (+) в точках пересечения линий */}
            <div className="grid-plus pos-25-25">+</div>
            <div className="grid-plus pos-25-50">+</div>
            <div className="grid-plus pos-25-75">+</div>

            <div className="grid-plus pos-50-25">+</div>
            <div className="grid-plus pos-50-50">+</div>
            <div className="grid-plus pos-50-75">+</div>
        </div>
    )
}

export default GridDetails
