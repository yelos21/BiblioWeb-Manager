import RestablecerContrasenaForm from "./form";

export const instant = false;

type SearchParams = {
  token?: string | string[];
  error?: string | string[];
};

export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <RestablecerContrasenaForm
      token={token ?? null}
      tokenError={error ?? null}
    />
  );
}
