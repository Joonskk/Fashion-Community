const Filter = () => {
    const filterMenu = [
        {label: "남", key: 1},
        {label: "여", key: 2},
    ]

    return (
        <div className="px-5 pt-4 flex">
            {
                filterMenu.map((item)=>{
                    return(
                        <div className="w-[40px] h-[40px] border border-gray-200 rounded-md mx-1 flex justify-center items-center font-bold" key={item.key}>
                            {item.label}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Filter;