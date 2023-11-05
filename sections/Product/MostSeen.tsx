import type { SectionProps } from "deco/mod.ts";
import { supabase } from "../../routes/supabase/index.ts";
import { calculatePercentageDifference } from "../../utils/CalculatePercentageDifference.ts";
import { countDuplicates } from "../../utils/CountDuplicates.ts";

export type Props = {
  title?: string;
  subTitle?: string;
};

export async function loader(props: Props, _req: Request, ctx: any) {
  const { data } = await supabase.from("recommender").select("*");

  const duplicateItemsCount = countDuplicates(data!);

  function findFourLargestValues(arr, property) {
    arr.sort((a, b) => b[property] - a[property]);
    const largestValues = arr.slice(0, 4);
    return largestValues;
  }

  const property = "count";
  const trendResult = findFourLargestValues(duplicateItemsCount!, property);

  const results = trendResult?.map(async (r) => {
    const newUrl = r.key.split("/").splice(3, 10);
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

    const offer = calculatePercentageDifference({
      num1: salesPrice,
      num2: listPrice,
    });

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

  const promiseResult = await Promise.all(results!);

  const products = promiseResult;

  return {
    title: "Trending products 🔥",
    subTitle: "The most seen products",
    products,
  };
}

export default function MostSeen({
  title,
  subTitle,
  products,
}: SectionProps<typeof loader>) {
  return (
    <>
      {products.length <= 0 ? (
        <div></div>
      ) : (
        <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 class="text-2xl leading-8 lg:leading-10 text-base-content text-center lg:text-4xl">
            {title}
          </h2>
          <h3 class="leading-6 lg:leading-8 text-neutral text-center lg:text-2xl">
            {subTitle}
          </h3>

          <div class="grid grid-cols-1 mt-8 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map((p) => (
              <a href={p?.url} class="group border rounded-md relative">
                <div class="p-4">
                  <div class="text-white bg-red-500 px-2 py-1 text-xs rounded absolute top-3 left-2">
                    {p?.off}% Off
                  </div>
                  <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                    <img
                      src={p?.image}
                      alt="Tall slender porcelain bottle with natural clay textured body and cork stopper."
                      class="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <h3 class="mt-4 text-sm text-gray-700">{p?.title}</h3>
                  <p class="mt-1 text-lg font-medium text-gray-900">
                    R$&nbsp;{p?.salesPrice}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
