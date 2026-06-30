"use client";

const WHATSAPP_NUMBER = "919897965454";
const WHATSAPP_MESSAGE = encodeURIComponent("Hello, I am interested in your products.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        left: "auto",
        zIndex: 99999,
      }}
    >
      <style>{`
        @keyframes wa-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes wa-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        .wa-wrap { position: relative; display: inline-flex; animation: wa-float 3s ease-in-out infinite; }
        .wa-ring {
          position: absolute; inset: 0; border-radius: 9999px;
          background: #25D366;
          animation: wa-ring 2.2s ease-out infinite;
          pointer-events: none;
        }
        .wa-link {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 9999px;
          background: #25D366;
          box-shadow: 0 4px 20px rgba(37,211,102,0.45);
          transition: box-shadow 0.3s, transform 0.2s;
          text-decoration: none;
        }
        .wa-link:hover { box-shadow: 0 6px 28px rgba(37,211,102,0.6); transform: scale(1.08); }
      `}</style>
      <div className="wa-wrap">
        <div className="wa-ring" />
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="wa-link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.845L.057 23.09a.75.75 0 0 0 .906.942l5.424-1.426A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.504-5.234-1.387l-.374-.22-3.875 1.018 1.04-3.788-.24-.388A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
