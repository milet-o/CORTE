import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#e8673a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          borderRadius: 8,
          fontWeight: 900,
          border: '2px solid #1d1714',
        }}
      >
        c.
      </div>
    ),
    {
      ...size,
    }
  );
}
