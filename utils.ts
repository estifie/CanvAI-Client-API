import sharp from "sharp";

const processImage = async (image_data: string) => {
	const buffer = Buffer.from(image_data, "base64");

	const processedImage = await sharp(buffer).resize(28, 28).greyscale().threshold(50).toBuffer();

	const processedImageBase64 = processedImage.toString("base64");

	return processedImageBase64;
};

export { processImage };
