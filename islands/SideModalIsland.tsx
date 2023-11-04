import { useState } from "preact/hooks";
import type { ImageWidget } from "apps/admin/widgets.ts";

interface Props {
  buttonTitle?: string;
  title?: string;
  section?: string;
  section2?: string;
  category?: string;
  description?: string;
  productName?: string;
  discount?: string;
  image?: ImageWidget;
}

export default function SideModalIsland({
  buttonTitle = "Extra 10% OFF",
  title = "BLACK FRIDAY",
  section = "Best Offers",
  section2 = "Exemple2",
  category = "T-shirts",
  description = "Best Products",
  productName = "T-shirt Black",
  discount = "10% OFF" ,
  image = "https://images.unsplash.com/photo-https://d2vq4s943o8cb4.cloudfront.net/Custom/Content/Products/15/76/15767858_camiseta-lds-rocks-loja-do-suplemento-6994_l1_636459202348870883.png-1c9102c219da?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = () => {
    setIsModalVisible(!isModalVisible);
  }

  return (
    <>
      <div className={"fixed flex-row top-80 z-50 sm:flex h-72 modal-open transition-all duration-500 ease-in-out"} style={{right:isModalVisible ? "0" : "-380px"}}>
      <button onClick={handleClick} className="bg-red-500 text-white inset-y-0 left-0 w-10 relative whitespace-nowrap flex items-center justify-center ">
          <div className="-rotate-90 text-m underline font-bold uppercase">{buttonTitle}</div>
        </button>
        <div className={`bg-orange-200 p-4 transform translate-x-0 w-[380px]`}>
          <div className="flex flex-col h-64 p-3 bg-white rounded-lg shadow-lg">
            <div className="text-center text-black font-bold mb-4 text-xl" >{title}</div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="uppercase font-semibold">{section}</div>
                <div className="font-bold">{category}</div>
                <div>{description}</div>
                <div className="top-1 font-bold text-4xl text-red-600 right-0">{discount}</div>
              </div>
              <div>
                <img src={image} alt={productName} className="w-54 h-32 object-cover rounded-md"/>
                <p className="mt-2 text-center font-semibold">{productName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
