// Importing React hook for managing component state
import { useEffect, useRef, useState } from "react"
// Importing React icon component
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

// Defining a functional component ChipInput
export default function ChipInput({
  // Props to be passed to the component
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)

  // Setting up state for managing chips array
  const [chips, setChips] = useState([])

  const isFirstRun = useRef(true)

  useEffect(() => {
    if (editCourse) {
      // tag may be saved as an array or as a JSON string
      let saved = course?.tag ?? []
      if (typeof saved === "string") {
        try { saved = JSON.parse(saved) } catch { saved = [saved] }
      }
      setChips(Array.isArray(saved) ? saved : [])
    }
    register(name, {
      validate: (value) => (value?.length ?? 0) > 0 || `${label} is required`,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Re-validate on change so the error clears as soon as a tag is added
    setValue(name, chips, { shouldValidate: !isFirstRun.current })
    isFirstRun.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips])

  // Add one or more tags (comma separated) from the text box
  const addChips = (input) => {
    const values = input.value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
    if (values.length === 0) return
    setChips((prev) => [...new Set([...prev, ...values])])
    input.value = ""
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addChips(event.target)
    }
  }

  // Function to handle deletion of a chip
  const handleDeleteChip = (chipIndex) => {
    // Filter the chips array to remove the chip with the given index
    const newChips = chips.filter((_, index) => index !== chipIndex)
    setChips(newChips)
  }

  // Render the component
  return (
    <div className="flex flex-col space-y-2">
      {/* Render the label for the input */}
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      {/* Render the chips and input */}
      <div className="flex w-full flex-wrap gap-y-2">
        {/* Map over the chips array and render each chip */}
        {chips.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-5"
          >
            {/* Render the chip value */}
            {chip}
            {/* Render the button to delete the chip */}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}
        {/* Render the input for adding new chips */}
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          // Typed-but-not-entered text is kept when leaving the field
          onBlur={(e) => addChips(e.target)}
          className="form-style w-full"
        />
      </div>
      <p className="ml-1 text-xs text-richblack-400">
        Press Enter or comma to add a tag
      </p>
      {/* Render an error message if the input is required and not filled */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}