import { database } from "@/lib/db";
import BannerImpressionTracker from "./BannerImpressionTracker";

const SIZES: Record<string, string> = {
  topo: "min-h-[90px]",
  "meio-feed": "min-h-[120px]",
  lateral: "min-h-[250px]",
  artigo: "min-h-[280px]"
};

export default async function AdBanner({ posicao }: { posicao: string }) {
  const banner = await database.getBannerParaExibir(posicao);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!banner) return null;

  return (
    <div
      className={`w-full ${SIZES[posicao] || "min-h-[100px]"} flex items-center justify-center bg-white border border-dashed border-line rounded-sm overflow-hidden`}
      data-ad-position={posicao}
    >
      <BannerImpressionTracker bannerId={banner.id} />
      {banner.tipo === "adsense" && client ? (
        <ins
          className="adsbygoogle block w-full h-full"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={banner.slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : banner.tipo === "html" && banner.html ? (
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: banner.html }}
        />
      ) : (
        <span className="font-ui text-xs uppercase tracking-wide text-charcoal/40">
          Espaço publicitário · {posicao}
        </span>
      )}
    </div>
  );
}
