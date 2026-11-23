import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "react-hot-toast"
import { FiImage, FiUploadCloud } from "react-icons/fi"

import "video-react/dist/video-react.css"
import { Player } from "video-react"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const [fileName, setFileName] = useState("")
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => {
    register(name, { required: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register])

  // Show the saved thumbnail/video when editing (data can arrive after mount)
  useEffect(() => {
    const existing = viewData || editData
    if (existing) {
      setPreviewSource(existing)
      setValue(name, existing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewData, editData])

  // Free the temporary preview URL when it is replaced or removed
  useEffect(() => {
    return () => {
      if (previewSource?.startsWith?.("blob:")) URL.revokeObjectURL(previewSource)
    }
  }, [previewSource])

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setPreviewFailed(false)
      setFileName(file.name)
      setPreviewSource(URL.createObjectURL(file))
      setValue(name, file, { shouldValidate: true })
    }
  }

  const onDropRejected = () => {
    toast.error(video ? "Please select an MP4 video" : "Please select an image file")
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // Any image format is accepted; the server converts it to a 16:9 JPG
    accept: !video
      ? {
          "image/*": [
            ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg",
            ".avif", ".heic", ".heif", ".tif", ".tiff", ".ico",
          ],
        }
      : { "video/*": [".mp4"] },
    multiple: false,
    // Use the classic <input type="file"> picker; the newer File System
    // Access picker is unreliable with type filters on some browsers
    useFsAccessApi: false,
    onDrop,
    onDropRejected,
  })

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>
      <div
        className={`${
          isDragActive ? "bg-richblack-600" : "bg-richblack-700"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
      >
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              // Same 16:9 crop the server applies, so the preview matches the result
              <>
              <div className="aspect-video w-full overflow-hidden rounded-md bg-richblack-900">
                {previewFailed ? (
                  // e.g. HEIC/TIFF: browser can't display it, but the server converts it
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <FiImage className="text-4xl text-yellow-50" />
                    <p className="break-all text-sm text-richblack-5">{fileName}</p>
                    <p className="text-xs text-richblack-300">
                      Image added ✓ Preview isn't supported for this format; it
                      will be converted to a 16:9 JPG on upload.
                    </p>
                  </div>
                ) : (
                  <img
                    src={previewSource}
                    alt="Preview"
                    onError={() => setPreviewFailed(true)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              {fileName && !previewFailed && (
                <p className="mt-2 truncate text-xs text-richblack-300">
                  ✓ {fileName}
                </p>
              )}
              </>
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("")
                  setFileName("")
                  setPreviewFailed(false)
                  setValue(name, null, { shouldValidate: true })
                }}
                className="mt-3 text-richblack-400 underline"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div
            // Fill the whole dashed box so clicking/dropping anywhere works
            className="flex min-h-[250px] w-full flex-col items-center justify-center self-stretch p-6"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-sm text-richblack-200">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span className="font-semibold text-yellow-50">Browse</span> a
              file
            </p>
            <ul className="mt-10 flex list-disc justify-between space-x-12 text-center  text-xs text-richblack-200">
              {!video ? (
                <>
                  <li>Any image format</li>
                  <li>Auto-cropped to 16:9</li>
                </>
              ) : (
                <>
                  <li>Aspect ratio 16:9</li>
                  <li>MP4 format</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
