import type { SectionProps } from "deco/mod.ts";
import type { ImageWidget } from "apps/admin/widgets.ts";
import { supabase } from "../../routes/supabase/index.ts";
import { getIP } from "https://deno.land/x/get_ip/mod.ts";

const getMyIP = async () => {
  const ip = await getIP({ ipv6: true });
  return ip;
};
getMyIP();

function calculatePercentageDifference(num1, num2) {
  const diff = Math.abs(num1 - num2);
  const avg = (num1 + num2) / 2;
  const percentageDiff = (diff / avg) * 100;
  return percentageDiff;
}

export type Product = {
  title?: string;
  listPrice?: string;
  salesPrice?: string;
  image?: ImageWidget;
  description?: string;
  url?: string;
  category?: string;
  off?: string;
};

export type Props = {
  title?: string;
  products?: Product[];
};

export async function loader(props: Props, _req: Request, ctx: any) {
  const { data } = await supabase
    .from("recommender")
    .select("*")
    .eq("userId", "127.0.0.1");

  const newData = Array.from(
    new Map(data?.map((obj) => [obj.url, obj])).values()
  );

  const results = newData?.map(async (r) => {
    // const title = r?.title.replace(/\s+/g, '-').toLowerCase()
    const newUrl = r.url.split("/").splice(3, 10);
    const result = await ctx.invoke(
      "vtex/loaders/intelligentSearch/productDetailsPage.ts",
      { slug: `/${newUrl.join("/")}` }
    );

    const salesPrice = parseInt(
      result.product.isVariantOf.hasVariant[0].offers.offers[0]
        .priceSpecification[1].price
    );

    const listPrice = parseInt(
      result.product.isVariantOf.hasVariant[0].offers.offers[0]
        .priceSpecification[0].price
    );

    const offer = calculatePercentageDifference(salesPrice, listPrice);

    console.log(offer);

    return {
      title: result.product.name,
      description: result.product.description,
      url: result.product.url,
      image: result.product.isVariantOf.hasVariant[0].image[0].url,
      salesPrice:
        result.product.isVariantOf.hasVariant[0].offers.offers[0]
          .priceSpecification[1].price,
      listPrice:
        result.product.isVariantOf.hasVariant[0].offers.offers[0]
          .priceSpecification[0].price,
      off: Math.round(offer),
    };
  });

  const products = await Promise.all(results!);

  return {
    title: "Keep shopping",
    products,
  };
}

export default function ProductList({
  title,
  products,
}: SectionProps<typeof loader>) {
  return (
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 ">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>

      <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products?.map((p) => (
          <div class="group relative border rounded-md">
            <div class="px-8 py-4 group-hover:opacity-75">
              <div class="absolute px-3 py-1 rounded top-2 right-1 bg-red-500 text-white text-sm">
                -{p.off}% Off
              </div>
              <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none  lg:h-80">
                <img
                  src={p.image}
                  alt="Front of men&#039;s Basic Tee in black."
                  class="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div class="mt-4 flex justify-between items-start">
                <div>
                  <h3 class="text-sm text-gray-700">
                    <a href={p.url}>
                      <span aria-hidden="true" class="absolute inset-0"></span>
                      {p.title}
                    </a>
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">{p.description}</p>
                </div>
                <div class="flex flex-col items-center">
                  <p class=" font-large text-green-500 break-keep">R$&nbsp;{p.salesPrice}</p>
                  <p class="text-sm font-medium line-through text-red-500 break-keep">
                    R$&nbsp;{p.listPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
