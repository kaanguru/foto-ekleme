<template>
  <Page>
    <ActionBar>
      <Label class="title" text="Fotoğraf Ekleme" col="1" />
    </ActionBar>

    <GridLayout columns="*" rows="330,60">
      <Image :src="photo" stretch="aspectFill" row="0" height="300" width="300" />
      <Button text="foto çek" @tap="take" row="1" />
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import * as camera from "nativescript-camera";
import { Image } from "tns-core-modules/ui/image";
import { ImageSource, fromFile, fromResource, fromBase64 } from "tns-core-modules/image-source";
import { Folder, path, knownFolders } from "tns-core-modules/file-system";
export default {
  data() {
    return {
      arrayPictures: [],
      photo: null,
    };
  },
  methods: {
    take() {
      camera
        .takePicture({
          width: 300,
          height: 300,
          keepAspectRatio: true,
        })
        .then((imageAsset) => {
          console.log("Size: " + imageAsset.options.width + "x" + imageAsset.options.height);
          console.log("keepAspectRatio: " + imageAsset.options.keepAspectRatio);
          // SAVE IMAGE
          ImageSource.fromAsset(imageAsset).then((imageSource: ImageSource) => {
            const fileName: string = "kus" + "-" + new Date().getTime() + ".jpg";
            const folderPath: string = knownFolders.documents().path;
            const filePath: string = path.join(folderPath, fileName);
            const saved: boolean = imageSource.saveToFile(filePath, "jpg");
            if (saved) {
              console.log("Saved: " + filePath);
              console.log("Image saved successfully!");
            } else {
              console.log("not saved");
            }
            const loadedImage: ImageSource = ImageSource.fromFileSync(filePath);
            this.photo = loadedImage;
            console.log("this.photo :>> ", this.photo);
          });
        })
        .catch((err) => {
          console.log("Error -> " + err.message);
        });
    },
  },
  mounted() {
    camera.requestPermissions().then(
      //request permissions for camera
      (success) => {
        //have permissions
      },
      (failure) => {
        //no permissions for camera
      }
    );
  },
};
</script>

<style scoped></style>
