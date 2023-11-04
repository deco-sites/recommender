import type { SectionProps } from "deco/mod.ts";
import { supabase } from "../../routes/supabase/index.ts";
import { countDuplicates } from "../../utils/CountDuplicates.ts";
import { getIP } from "https://deno.land/x/get_ip/mod.ts";
import { calculatePercentageDifference } from "../../utils/CalculatePercentageDifference.ts";

export type Props = {
  title?: string;
  subTitle?: string;
};

export async function loader(props: Props, _req: Request, ctx: any) {
  const ip = await getIP({ ipv6: true });
  const { data } = await supabase
    .from("recommender")
    .select("*")
    .eq("userId", ip);

  const duplicateItemsCount = countDuplicates(data!);

  function findFirstValue(arr, property) {
    arr.sort((a, b) => b[property] - a[property]);
    const largestValues = arr.slice(0, 1);
    return largestValues;
  }

  const property = "count";
  const trendResult = findFirstValue(duplicateItemsCount!, property);

  const newUrl = trendResult[0].key.split("/").splice(3, 10);

  const topResult = await ctx.invoke(
    "vtex/loaders/intelligentSearch/productDetailsPage.ts",
    { slug: `/${newUrl.join("/")}` }
  );

  const rawCategory = topResult.product.category;

  const categoryResult = rawCategory.split(">");
  const categoryLength = categoryResult.length;
  const category = categoryResult[categoryLength - 1];

  const result = await ctx.invoke(
    "vtex/loaders/intelligentSearch/suggestions.ts",
    { query: category, count: 4 }
  );

  const products = result.products.map((r) => {
    const salesPrice = parseInt(r.offers.offers[0].priceSpecification[1].price);

    const listPrice = parseInt(r.offers.offers[0].priceSpecification[0].price);

    const offer = calculatePercentageDifference({
      num1: salesPrice,
      num2: listPrice,
    });

    return {
      title: r.name,
      url: r.url,
      description: r.description,
      image: r.image[0].url,
      listPrice: r.offers.offers[0].priceSpecification[0].price,
      salesPrice: r.offers.offers[0].priceSpecification[1].price,
      off: Math.round(offer),
    };
  });

  return {
    title: "Recommended for you",
    subTitle: "Maybe you like it",
    products,
  };
}

export default function RecommendedProducts({
  title,
  subTitle,
  products,
}: SectionProps<typeof loader>) {
  return (
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 class="text-2xl leading-8 lg:leading-10 text-base-content text-center lg:text-4xl">
        {title} ✅
      </h2>
      <h3 class="leading-6 lg:leading-8 text-neutral text-center lg:text-2xl">
        {subTitle}
      </h3>
      <div class="grid grid-cols-1 mt-8 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((r) => (
          <div class="group my-10 flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md ">
            <a
              class="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl"
              href={r.url}
            >
              <img
                class="peer absolute top-0 right-0 h-full w-full object-cover"
                src={r.image}
                alt="product image"
              />
              <span class="absolute top-0 left-0 m-2 rounded-full bg-red-500 px-2 text-center text-sm font-medium text-white">
                -{r.off}%
              </span>
            </a>
            <div class="mt-4 px-5 pb-5">
              <a href="#">
                <h5 class="text-xl tracking-tight text-slate-900">{r.title}</h5>
              </a>
              <div class="mt-2 mb-5 flex items-center justify-between">
                <p>
                  <span class="text-3xl font-bold text-slate-900 mr-2">
                    R$&nbsp;{r.salesPrice}
                  </span>
                  <span class="text-sm text-slate-900 line-through">
                    R$&nbsp;{r.listPrice}
                  </span>
                </p>
              </div>
              <a
                href="#"
                class="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Add to cart
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
