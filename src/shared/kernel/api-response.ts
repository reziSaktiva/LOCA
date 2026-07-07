type ApiErrorPayload = {
  code: string;
  message: string;
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return Response.json({ success: true, data }, init);
}

export function apiError(error: ApiErrorPayload, status: number) {
  return Response.json({ success: false, error }, { status });
}
