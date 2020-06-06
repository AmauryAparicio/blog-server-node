'use strict'

var validator = require('validator');
var Article = require('../models/article');

var controller = {

    /* -------------------------------------------------------------------------- */
    /*                      Metodo para guardar los artículos                     */
    /* -------------------------------------------------------------------------- */

    save: (req, res) => {

        /* --------------------------- Recoger parametros --------------------------- */

        let params = req.body;

        /* ------------------------------ Validar datos ----------------------------- */

        try {

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(400).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            })
        }

        if (validate_title && validate_content) {

            /* ------------------------ Crear el objeto a guardar ----------------------- */

            let article = new Article();

            /* ----------------------------- Asignar valores ---------------------------- */

            article.title = params.title;
            article.content = params.content;
            article.image = null;

            /* --------------------------- Guardar el articulo -------------------------- */

            article.save((err, articleStored) => {

                if (err || !articleStored) {
                    return res.status(400).send({
                        status: 'error',
                        message: 'El articulo no se guardó'
                    })
                }

                /* --------------------------- Devolver respuesta --------------------------- */

                return res.status(201).send({
                    status: 'success',
                    article: articleStored,

                });
            });
        } else {

            return res.status(400).send({
                status: 'error',
                message: 'Los datos no son validos'
            })
        }
    },

    /* -------------------------------------------------------------------------- */
    /*                      Método para obtener los artículos                     */
    /* -------------------------------------------------------------------------- */

    getArticles: (req, res) => {

        let query = Article.find({});

        let last = req.params.last;

        if (last || last != undefined) {
            query.limit(5);
        }

        /* -------------------------- Buscamos el artículo -------------------------- */

        query.sort('-_id').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los artículos'
                });
            }

            if (!articles) {
                return res.status(400).send({
                    status: 'error',
                    message: 'No hay artículos para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        })
    },

    /* -------------------------------------------------------------------------- */
    /*                    Método para obtener un solo artículo                    */
    /* -------------------------------------------------------------------------- */

    getArticle: (req, res) => {

        /* ------------------------- Recoger el id de la ulr ------------------------ */

        let articleId = req.params.id;

        /* -------------------------- Comprobar que existe -------------------------- */

        if (!articleId || articleId == null) {

            return res.status(400).send({
                status: 'error',
                message: 'No existe ese artículo'
            });
        }

        /* --------------------------- Buscar el articulo --------------------------- */

        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el artículo'
                });
            }

            /* --------------------------- Devolverlo en JSON --------------------------- */

            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },

    /* -------------------------------------------------------------------------- */
    /*                      Actualizar un artículo existente                      */
    /* -------------------------------------------------------------------------- */

    update: (req, res) => {

        /* ----------------------- Recoger el id del artículo ----------------------- */

        let articleId = req.params.id;

        /* ------------------ Recoger los datos que llegan por put ------------------ */

        let params = req.body;

        /* ------------------------------ Validar datos ----------------------------- */

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            })
        }

        if (validate_title && validate_content) {

            /* ------------------------- Encontrar y actualizar ------------------------- */

            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }

                if (!articleUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el artículo'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdate,
                })
            });

            /* ----------------------- Devolver respuesta en JSON ----------------------- */
        } else {

            return res.status(400).send({
                status: 'error',
                message: 'La validación no es correcta'
            })
        }

    },

    /* -------------------------------------------------------------------------- */
    /*                       Método para eliminar artículos                       */
    /* -------------------------------------------------------------------------- */

    delete: (req, res) => {

        /* ------------------------- Recoger el id de la url ------------------------ */

        let articleId = req.params.id;

        /* ---------------------------- Buscar y eliminar --------------------------- */

        Article.findOneAndDelete({ _id: articleId }, (err, articleRemove) => {
            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                })

            }

            if (!articleRemove) {

                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, probablemente no exista'
                })
            }


            return res.status(200).send({
                status: 'success',
                article: articleRemove
            })
        });

    },

    /* ----------------------- Método para subir archivos ----------------------- */

    upload: (req, res) => {

    }
};

module.exports = controller;