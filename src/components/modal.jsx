"use client"

import { X } from "lucide-react"

const Modal = ({ title, description, actions, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-5 md:p-8 rounded-xl w-full max-w-md relative shadow-xl border-2 border-amber-200">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-amber-900">
          {title}
        </h2>

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <p className="text-center text-sm md:text-base text-amber-800 mb-6">
          {description}
        </p>

        <div className="flex justify-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  )
}

export default Modal